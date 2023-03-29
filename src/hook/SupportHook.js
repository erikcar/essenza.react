import { Form } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { DataSource, Observable, EntityModel, syncle } from "@essenza/core";

const mutation = function (mutated, state, model) {
  const node = state.node;
  const data = state.source;
  for (const key in mutated) {
    node.mutate(key, mutated[key], data);
  }
}

export const useSyncle = () =>{

  const [result, setResult] = useState(syncle.result);

  useEffect(()=>{
    syncle.subscribe(setResult);
    return () => syncle.unscribe(setResult);
  }, [setResult])

  return result;
}

export const usePolling = (fnc) =>{
  const poller = useRef(syncle.poll(fnc));

  useEffect(()=>{
    //syncle.subscribe(poller.current);
    return () => syncle.unpoll(poller.current);
  }, [poller.current])

  return poller.current;
}

/**
 * 
 * @param {*} name 
 * @param {*} source 
 * @param {*} model 
 * @param {*} formatter 
 * @returns 
 */
export const useForm = (name, source, control, formatter, schema) => {
  let model;
  if (control instanceof EntityModel) {
    model = control;
    control = model.control;
  }
  source = source || new DataSource({});
  const [target] = Form.useForm();

  const form = useMemo(() => {
    const _form = new ObservableForm(target, source?.data, schema, formatter);
    if (target && schema) {
      target.schema = schema;
      target.vdata = {};
    }

    _form.name = name;
    _form.target = target;
    _form.control = control;
    _form.source = source;

    control.context.registerElement(name, _form);

    if (model) {
      if(!model.form) model.form = {};
      model.form[name] = _form;
    }
    return _form;
  }, [])

  useEffect(() => {
    console.log("DEBUG USE FORM RESET", source, form);
    if (!source || !source.data || (form.source?.data && form.source.data.id !== source.data.id))
      form.target.resetFields();
    form.source = source;
  }, [source]);

  useEffect(() => {
    form.control = control;
  }, [control]);

  return form;
}

export function ObservableForm(form, data, schema, formatter) {
  this.target = form;
  this.observable = new Observable(form, data, null, schema);
  this.source = null;
  this.checked = false;
  this.schema = schema;
  this.formatter = formatter;

  Object.defineProperty(this, "data", {
    get() { return this.source ? this.source.data : undefined; },
  });

  this.observe = function (fields, emitters) {
    return this.observable.observe(fields, emitters);
  }

  this.validate = async function (name) {
    const form = this.target;//context.getForm(name);
    if (!form) return { isValid: false, form: null };
    //let source = form.__source__;
    return await form.validateFields()
      .then(values => {
        console.log("DEBUG FORM VALIDATOR OK", name);
        this.source.format(); //Formatto eventuale data TEMP (anche nel caso che nessun valore è mutato)
        this.mutateValues();
        this.checked = true;
        //form.resetFields();
        return { isValid: true, data: this.source.data, node: this.source.node, form: form, values: form.getFieldsValue(true) };
      })
      .catch(errorInfo => {
        console.log("DEBUG VALIDATOR ERROR", errorInfo); //Si può fare publish di error che da app viene ascoltatato e riportato a user in modo cetntralizzato
        return { isValid: false, data: this.source.data, node: this.source.node, form: form, reason: errorInfo, formix: this };
      });
  };

  this.setValue = function (field, value) {
    console.log("SET VALUE", this.target);
    const obj = {};
    obj[field] = value;
    this.target.setFieldsValue(obj);

    this.valueChanged(field, value);
  }

  this.valueChanged = function (field, value) {
    if (this.data) {
      if (!this.changedValues) {
        this.changedValues = {};
      }

      value = value || this.target.getFieldValue(field);
      console.log("IS VALUE CHANGED?", field, value, this.data, this);
      if (value && value.hasOwnProperty('label')) {
        this.data[field + "_label"] = value.label;
        value = value.value;
        console.log("LABEL CHANGED", this.data[field + "_label"]);
      }

      if (this.data[field] !== value) {
        this.changedValues[field] = value;
        console.log("VALUE CHANGED", field, value);
        return true;
      }
    }
    return false;
  }

  this.submitForm = async function (name) {
    const [isValid, source] = await this.validate(name);
    if (isValid) {
      source.node.save();
    }
  }

  this.resetForm = function (name) {
    const form = this.target;
    if (form) form.resetFields();
  }

  /**
   * 
   * @param {DataSource} source 
   * @param {*} values 
   */
  this.mutateValues = function () {
    const values = this.changedValues; 
    if (!values)
      return;

    const { data, node } = this.source;
    //debugger;
    console.log("DEBUG FORM USE FORM MUTATE", values, node, this.contextid);
    for (const key in values) {
      if (Object.hasOwnProperty.call(values, key)) {
        this.source.mutate(key, values[key], data);
      }
    }
  }

  this.format = function (value) {
    value = value || this.source?.data;
    if (this.formatter && value) {
      value = { ...value };
      for (const key in this.formatter) {
        if (Object.hasOwnProperty.call(value, key)) {
          value[key] = this.formatter[key](value[key], value);
        }
      }
    }
    return value;
  }

  this.parse = function (value) {

  }

  this.getValue = function (field) {

  }

  this.getValues = function () {

  }
}

export const usePrinter = () => {
  const printer = useRef({});
  return printer.current;
}

/*export const useForm = (name, source, model) =>{
  const [form] = Form.useForm();
  
  form.__name__ = name;
  //model.form[name] = form;
  model.context.registerForm(name, form); //Controllare se ne esiste uno già registrato => worning or error
  useEffect(()=>{
      console.log("DEBUG USE FORM RESET", source, form.__source__);
      if(!source || !source.data || (form.__source__?.data && form.__source__.data.id !== source.data.id))
        form.resetFields();
      form.__source__ = source;
      //form.resetFields();
      return () => { console.log("USE FORM RESET UNMONT", form.isFieldsTouched());}
  },
  [source, form]);

  return form;
}*/

