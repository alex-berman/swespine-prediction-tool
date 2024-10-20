import { formStructure } from "./form_structure.js";
import { getDataDefinition } from "./data_model.js";

export function createFormFieldWidget(field) {
  const groupDiv = document.createElement('div');
  groupDiv.className = 'form-group';

  const label = document.createElement('label');
  label.setAttribute('for', field.name);
  label.className = 'label';
  label.innerHTML = field.label;
  groupDiv.appendChild(label);

  if(field.type == 'select') {
    const select = document.createElement('select');
    select.id = field.name;
    select.className = 'input';
    for(let i = 0; i < field.labels.length; i++) {
      const option = document.createElement('option');
      option.text = field.labels[i];
      option.value = i;
      select.appendChild(option);
    }
    groupDiv.appendChild(select);
  }
  else if(field.type == 'radio') {
    const div = document.createElement('div');
    div.classList.add('input');
    div.classList.add('radio-group');
    for(let i = 0; i < field.labels.length; i++) {
      const input = document.createElement('input');
      input.type = 'radio';
      input.id = field.name + i;
      input.name = field.name;
      input.value = i;
      div.appendChild(input);

      const label = document.createElement('label');
      label.setAttribute('for', input.id);
      label.innerHTML = field.labels[i];
      div.appendChild(label);
    }
    groupDiv.appendChild(div);
  }
  else if(field.type == 'toggle') {
    const div = document.createElement('div');
    div.classList.add('input');
    div.classList.add('radio-group');
    for(let i = 1; i >= 0; i--) {
      const input = document.createElement('input');
      input.type = 'radio';
      input.id = field.name + i;
      input.name = field.name;
      input.value = i;
      div.appendChild(input);

      const label = document.createElement('label');
      label.setAttribute('for', input.id);
      label.innerHTML = field.labels[i];
      div.appendChild(label);
    }
    groupDiv.appendChild(div);
  }
  else if(field.type == 'number') {
    const valueElement = document.createElement('input');
    valueElement.type = 'text';
    valueElement.inputmode = 'numeric';
    valueElement.id = field.name + '-value';
    valueElement.className = 'input';

    const rangeElement = document.createElement('input');
    rangeElement.type = 'range';
    rangeElement.id = field.name;
    const dataDefinition = getDataDefinition(field.name);
    rangeElement.min = dataDefinition.range.min;
    rangeElement.max = dataDefinition.range.max;
    rangeElement.step = dataDefinition.range.step;
    rangeElement.className = 'input';
    rangeElement.addEventListener('input', () => {
        valueElement.value = rangeElement.value;
    });

    valueElement.addEventListener('input', () => {
        let parsedValue = parseFloat(valueElement.value);
        if (parsedValue < dataDefinition.range.min) {
            parsedValue = dataDefinition.range.min;
        } else if (parsedValue > dataDefinition.range.max) {
            parsedValue = dataDefinition.range.max;
        }
        rangeElement.value = parsedValue;
    });

    groupDiv.appendChild(valueElement);
    groupDiv.appendChild(rangeElement);
  }
  else {
    throw new Error('Unsupported field type ' + field.type);
  }
  return groupDiv;
}

export function initializeForm(id) {
  const container = document.getElementById(id);

  for(const field of formStructure) {
    const widget = createFormFieldWidget(field);
    container.appendChild(widget);
  }

  function handleInputChange(event) {
    localStorage.setItem(event.originalTarget.name, event.originalTarget.value);
  }

  for(const element of document.forms[0].elements) {
    const value = localStorage.getItem(element.name);
    if(value) {
      if(element.type == 'radio' && element.value == value) {
        element.checked = true;
      }
    }
  }

  const formElements = document.querySelectorAll("input, select");
  formElements.forEach(function(element) {
    element.addEventListener("input", handleInputChange);
  });
}
