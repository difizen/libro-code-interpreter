import nbformat as nbf
from jupyter_client.kernelspec import KernelSpecManager
from libro_client.client import LibroNotebookClient
from libro_client.kernel import select_kernel


def create_notebook_with_kernel():
    # Select the appropriate kernel
    kernel_name = select_kernel()
    if not kernel_name:
        raise RuntimeError("No suitable Python kernel found.")

    # Create a new Notebook object
    nb = nbf.v4.new_notebook()

    # Retrieve kernel information
    ksm = KernelSpecManager()
    kernel_spec = ksm.get_kernel_spec(kernel_name)

    # Set the kernel metadata for the notebook
    nb.metadata.kernelspec = {
        'name': kernel_name,
        'display_name': kernel_spec.display_name,
        'language': kernel_spec.language
    }
    return nb


def execute_code(code: str):
    """
    Execute code by libro client
    Args:
        code (str): _description_
    """
    nb = create_notebook_with_kernel()
    # Add some example code cells
    nb.cells.append(nbf.v4.new_code_cell(code))
    client = LibroNotebookClient(nb)
    client.execute()
    return client
