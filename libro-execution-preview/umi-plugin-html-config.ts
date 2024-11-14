import type { IApi } from 'umi';

export default (api: IApi) => {
  const notebook = {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      kernelspec: { name: 'dbgpt', display_name: 'dbgpt', language: 'python' },
      language_info: {
        name: 'python',
        version: '3.10.15',
        mimetype: 'text/x-python',
        codemirror_mode: { name: 'ipython', version: 3 },
        pygments_lexer: 'ipython3',
        nbconvert_exporter: 'python',
        file_extension: '.py',
      },
      libro_execute_start_time: '2024-11-14T05:43:48.769068+00:00',
      libro_execute_end_time: '2024-11-14T05:43:48.793725+00:00',
    },
    cells: [
      {
        id: '4e176e9d',
        cell_type: 'code',
        metadata: {
          execution: {
            'shell.execute_reply.started': '2024-11-14T05:43:48.769677+00:00',
            'iopub.status.busy': '2024-11-14T05:43:48.787289Z',
            'iopub.execute_input': '2024-11-14T05:43:48.787608Z',
            'iopub.status.idle': '2024-11-14T05:43:48.791971Z',
            'shell.execute_reply': '2024-11-14T05:43:48.791047Z',
            'shell.execute_reply.end': '2024-11-14T05:43:48.793519+00:00',
          },
        },
        execution_count: 1,
        source: "print('hello world')",
        outputs: [{ output_type: 'stream', name: 'stdout', text: 'hello world\n' }],
      },
    ],
  };

  api.addHTMLHeadScripts(() => `var notebook = ${JSON.stringify(notebook)};`);
};
