import json
import sys

def csv_to_js(csv_file_path, js_file_path):
    current_variable_name = None
    data = {}
    with open(csv_file_path, mode='r', encoding='utf-8-sig') as csv_file:
        for line in csv_file:
            cells = line.split(';')
            if cells[0] != '':
                if ' – ' in cells[0]:
                    data[current_variable_name].append(float(cells[1]))
                elif cells[0].endswith(':'):
                    current_variable_name = cells[0].rstrip(':')
                    data[current_variable_name] = []
                else:
                    data[cells[0]] = float(cells[1])

    with open(js_file_path, mode='w', encoding='utf-8') as js_file:
        constant_name = js_file_path.replace('.js', '')
        js_file.write('export const ' + constant_name + ' = ',)
        json.dump(data, js_file, indent=4)
        js_file.write(';')

if __name__ == "__main__":
    raise Exception("It is not recommended to use this script since it treats nominal features differently "
                    "than the actual tool expects. Specifically, it does not add a zero-valued regressor for "
                    "the first level, which the tool expects.")
    if len(sys.argv) != 3 and len(sys.argv) != 4:
        print("Usage: python csv_to_js.py <input_csv_file> <output_js_file>")
        sys.exit(1)

    input_csv_file = sys.argv[1]
    output_js_file = sys.argv[2]
    csv_to_js(input_csv_file, output_js_file)
