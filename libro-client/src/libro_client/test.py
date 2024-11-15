import sys
from jupyter_client.kernelspec import KernelSpecManager

from libro_client import execute_code


if __name__ == "__main__":
    client = execute_code("print('hello world')")
    print(client.nb)
