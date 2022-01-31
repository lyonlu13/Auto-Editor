const obj = JSON.parse(editor.getValue());
const res = JSON.stringify(obj, null, "\t");
editor.setValue(res)
monaco.editor.setModelLanguage(editor.getModel(), "json");
