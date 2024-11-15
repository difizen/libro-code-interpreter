import requests


def fetch_html(url):
    try:
        # Send an HTTP GET request to the specified URL
        response = requests.get(url)

        # Check if the request was successful
        response.raise_for_status()  # Raises an HTTPError for bad responses

        # Output the retrieved HTML content
        html_content = response.text

        return html_content

    except requests.exceptions.RequestException as e:
        # Output request exception details
        print(f"An error occurred: {e}")
        return None
