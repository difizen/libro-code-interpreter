from io import TextIOWrapper
from nbclient import NotebookClient
from nbclient.util import ensure_async, run_sync
import nbformat
from nbformat import NotebookNode
from typing import Any, Callable, Dict, Iterable, List, Optional
import json
import traitlets
from datetime import datetime, timezone


def cell_start_execution(cell, **kwargs):
    cell.metadata.execution["shell.execute_reply.started"] = datetime.now(
        datetime.timezone.utc
    ).isoformat()


# class LibroExecutionStatus(BaseModel):
#     id: UUID = Field(default_factory=uuid4)
#     current_index: int = 0
#     start_time: Optional[str] = None
#     end_time: Optional[str] = None


class LibroNotebookClient(NotebookClient):
    execution_current_index: int = -1
    execution_start_time: Optional[datetime]
    execution_end_time: Optional[datetime]

    @property
    def executable_cells(self) -> List[NotebookNode]:
        return list(filter(lambda c: self.should_cell_execute(c), self.nb.cells))

    def reset_execution_trackers(self):
        super().reset_execution_trackers()
        self.execution_current_index = -1
        self.execution_start_time = None
        self.execution_end_time = None

    def __init__(
        self,
        nb: NotebookNode,
        km=None,
        args: dict | None = None,
        **kw,
    ):
        super().__init__(nb=nb, km=km, **kw)
        if isinstance(args, dict):
            self.args = json.dumps(args)
        else:
            self.args = args
        self.execution_start_time = None
        self.execution_end_time = None

    on_cell_execute = traitlets.Callable(
        default_value=cell_start_execution,
        allow_none=True,
    ).tag(config=True)

    async def inspect_execution_result(self):
        assert self.kc is not None
        cell_allows_errors = (
            not self.force_raise_errors) and (self.allow_errors)
        inspect_msg = await ensure_async(
            self.kc.execute(
                "from libro_client.utils import inspect_user_ns_variable\n\inspect_user_ns_variable('__libro_execute_result_dump_path__')",
                store_history=False,
                stop_on_error=not cell_allows_errors,
            )
        )
        # print(inspect_msg)
        # self.kc._async_get_shell_msg(msg_id)
        reply = await self.async_wait_for_reply(inspect_msg)
        if reply is not None:
            print(reply)

    def write(self, f: TextIOWrapper):
        return nbformat.write(self.nb, f)

    def should_cell_execute(self, cell: NotebookNode):
        if cell.cell_type != "code" or not cell.source.strip():
            return False
        if self.skip_cells_with_tag in cell.metadata.get("tags", []):
            return False
        return True

    async def async_execute(
        self, reset_kc: bool = False,
        before_nb_execution: Callable[[NotebookNode]] = None,
        after_nb_execution: Callable[[NotebookNode]] = None,
        before_cell_execution: Callable[[NotebookNode]] = None,
        after_cell_execution: Callable[[NotebookNode]] = None,
        **kwargs: Any
    ) -> NotebookNode:
        if reset_kc and self.owns_km:
            await self._async_cleanup_kernel()
        self.reset_execution_trackers()

        async with self.async_setup_kernel(**kwargs):
            assert self.kc is not None
            self.log.info("Executing notebook with kernel: %s" %
                          self.kernel_name)
            msg_id = await ensure_async(self.kc.kernel_info())
            info_msg = await self.async_wait_for_reply(msg_id)
            nb_metadata: dict = self.nb.metadata
            nb_cells: Iterable[NotebookNode] = self.nb.cells
            if info_msg is not None:
                if "language_info" in info_msg["content"]:
                    nb_metadata["language_info"] = info_msg["content"][
                        "language_info"
                    ]
                else:
                    raise RuntimeError(
                        'Kernel info received message content has no "language_info" key. '
                        "Content is:\n" + str(info_msg["content"])
                    )
            cell_allows_errors = (
                not self.force_raise_errors) and (self.allow_errors)
            self.execution_start_time = datetime.now(timezone.utc)
            nb_metadata["libro_execute_start_time"] = self.execution_start_time.isoformat()

            await pre_nb_execution()
            await ensure_async(
                self.kc.execute(
                    f"__libro_execute_args_dict__={self.args}\n",
                    store_history=False,
                    stop_on_error=not cell_allows_errors,
                )
            )
            if self.execute_result_path is not None:
                await ensure_async(
                    self.kc.execute(
                        f"__libro_execute_result__='{self.execute_result_path}'\n",
                        store_history=False,
                        stop_on_error=not cell_allows_errors,
                    )
                )
                self.execution_status.execute_result_path = self.execute_result_path
            for index, cell in enumerate(nb_cells):
                await self.async_execute_cell(
                    cell, index, execution_count=self.code_cells_executed + 1
                )
                self.execution_current_index = index
                try:
                    if cell.metadata.execution is None:
                        cell.metadata.execution = {}
                    cell_execution: dict = cell.metadata.execution
                    cell_execution["shell.execute_reply.end"] = (
                        datetime.now(timezone.utc).isoformat())
                except:
                    pass
            # await pre_nb_execution()

            self.set_widgets_metadata()
            self.kc.shutdown()
            self.execution_end_time = datetime.now(timezone.utc)
            nb_metadata["libro_execute_end_time"] = self.execution_end_time.isoformat()
        return self.nb

    execute = run_sync(async_execute)
