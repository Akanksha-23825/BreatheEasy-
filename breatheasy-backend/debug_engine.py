import exposure_engine
import inspect

print(f"File path: {exposure_engine.__file__}")
print("Source code of calculate_wes:")
print(inspect.getsource(exposure_engine.calculate_wes))
