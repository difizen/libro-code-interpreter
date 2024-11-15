import json
import re
from libro_client.code_executor import execute_code
from libro_code_interpreter.utils import is_ipython
from libro_code_interpreter.html_util import fetch_html


def sanitize_input(query: str) -> str:
    """Sanitize input to the python REPL.

    Remove whitespace, backtick & python (if llm mistakes python console as terminal)

    Args:
        query: The query to sanitize

    Returns:
        str: The sanitized query
    """

    # Removes `, whitespace & python from start
    query = re.sub(r"^(\s|`)*(?i:python)?\s*", "", query)
    # Removes whitespace & ` from end
    query = re.sub(r"(\s|`)*$", "", query)
    return query


DEFAULT_APP_HOST = 'https://libro-code-interpreter.vercel.app/'


def execute_ipython(code: str, host=DEFAULT_APP_HOST) -> int:
    """A Python code executor. Use this to execute python commands. Input should be a valid python command.

    Args:
        code: pytho code
    """

    command = sanitize_input(code, )
    try:
        if is_ipython():
            data = {
                "application/vnd.libro.prompt+json": '```python\n%s \n```' % (code)}
            from IPython.display import display
            display(data, raw=True)
            exec(command)
        else:
            client = execute_code(command)
            notebook_str = json.dumps(client.nb)
            md = to_markdown(notebook_str, host)
            print(md)
            # write to file
            # with open('index.md', 'w') as file:
            #     file.write(md)

            # html = to_html(notebook_str, host)
            # with open('index.html', 'w') as file:
            #     file.write(html)

    except Exception as e:
        print('Error ocurred while run python code: %s' % (command))
        raise e


def to_html(notebook_json: str, host=DEFAULT_APP_HOST) -> str:
    """Convert notebook json to html using iframe

    Args:
        notebook_json (str): notebook json
    """
    html = fetch_html(host)
    meta_start = html.find('<meta ')
    # add base url meta
    base_meta = f'<base href="{host}" />'
    html = html[:meta_start] + base_meta + html[meta_start:]

    script_start = html.find('<script>')
    script_end = html.find('</script>') + len('</script>')

    html = html[:script_start] + \
        f'<script>var notebook = {notebook_json};</script>' + \
        html[script_end:]
    # 'src="/' to 'src="host'
    # html = html.replace(
    #     'src="/', "src=\"%s" % (host))
    return html


def to_markdown(notebook_json: str, host=DEFAULT_APP_HOST) -> str:
    """Convert notebook json to markdown using iframe

    Args:
        notebook_json (str): notebook json
    """
    import urllib.parse
    safe_string = urllib.parse.quote_plus(notebook_json)
    return f'\n<iframe src="{host}?notebook={safe_string}" width="100%"  style="border:none"></iframe>\n'
