import sys
from jupyter_client.kernelspec import KernelSpecManager


def select_kernel():
    # Create a KernelSpecManager instance to get kernel information
    ksm = KernelSpecManager()
    kernel_specs = ksm.find_kernel_specs()

    # Get the current Python environment's version information
    current_python_version = f"python{sys.version_info.major}"

    native_kernel = None
    fallback_kernel = None

    for kernel_name, spec_path in kernel_specs.items():
        # Retrieve kernel specification details
        kernel_spec = ksm.get_kernel_spec(kernel_name)

        # Check if the kernel language is Python and matches the current Python version
        if kernel_spec.language == 'python':
            if current_python_version in kernel_name:
                native_kernel = kernel_name
            # As a fallback, record the first available Python kernel
            if fallback_kernel is None:
                fallback_kernel = kernel_name

    # Prefer the native kernel; if not found, use the first available Python kernel
    return native_kernel or fallback_kernel
