import { Button, Form, Input, Space } from "antd";
//import { CloseOutlined, PlusCircleOutlined } from '@ant-design/icons';
import React, { Children, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {Validator} from "./Validator";
import { VistaJS } from "./Vista";

const { Item } = Form;
export function Formix({ control, form, instance, initialValues, observe, children, disabled, ...rest }) {
    console.log("FORMIX DEBUG", control, form, rest);
    if (VistaJS.DEVELOPMENT) {
        if (!form)
            throw new Error("Formix must have model and form instance.");
    }
    
    const ref = useRef();
    const valueChange = (errorInfo) => {
        console.log('FORMIX Value CHANGED:', errorInfo);
    };

    const blur = (e) => {
        console.log("PASSA", e, e.target.id, e.target.parentNode.parentNode.parentNode.id, form.target.getFieldsValue(e.target.id), e.target);
        let field = e.target.id;
        if(!field)
            field = e.target.parentNode.parentNode.parentNode.id;
        if(form.valueChanged(field)){
            const values = form.target.getFieldsValue(true);
            form.observable.onPublish("onblur", { field: e.target.id, value: values[e.target.id], values: values });
        }
    };

    const onselect = (e) => {
        console.log("PASSA SELECT", e.detail); //e.target.id, form.target.getFieldsValue(e.target.id), e.target);
        const values = form.target.getFieldsValue(true);
        form.observable.onPublish("onselect", { field: e.detail.field, value: values[e.detail.field], values: values, data: e.detail.item });
    };

    const onfocus = (e) =>{
        if(!ref.current){
            ref.current = e.target.form;
            if (observe && observe.indexOf(',select,') > -1)
                ref.current.addEventListener('oselect', onselect);
        }
    }

    const props = { ...rest, form: form.target, initialValues: form.format(initialValues), onFocus: onfocus, onLoad: (e) => console.log("onselect", e), disabled: disabled } ;

    props.onBlur = blur; //Per ora faccio sempre check

    if (observe) {
        observe = ',' + observe + ',';
        /*if (observe.indexOf(',blur,') > -1)
            props.onBlur = blur;*/

        if (observe.indexOf(',change,') > -1)
            props.onValuesChange = valueChange;
    }

    return <Form {...props}>
        {children}

  </Form>;
}

export function FormixItem({children, ...props}){
    const form = Form.useFormInstance();
    if(form.schema && form.schema.fields[props.name])
        props = {...props, rules: [({ getFieldValue }) => ({validator(_, value) { form.vdata[props.name] = value; return form.schema.validateAt(props.name, form.vdata);},}),]}
    return React.createElement(Form.Item, props, children);
}
