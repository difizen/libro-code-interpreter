
from libro_code_interpreter.tool import execute_ipython


if __name__ == "__main__":
    execute_ipython("print('test')", host="http://localhost:8000/")
