import nbformat as nbf
from jupyter_client.kernelspec import KernelSpecManager
from libro_client.client import LibroNotebookClient
from libro_client.kernel import select_kernel


def load_notebook_node(notebook_file_path):
    nb = nbf.read(notebook_file_path, as_version=4)
    nb_upgraded = nbf.v4.upgrade(nb)
    if nb_upgraded is not None:
        nb = nb_upgraded
    return nb


def execute_notebook_file(notebook_file_path: str):
    """
    Execute notebook file by libro client
    Args:
        notebook_file_path (str): _description_
    """
    nb = load_notebook_node(notebook_file_path)
    client = LibroNotebookClient(nb)
    client.execute()
    return client
