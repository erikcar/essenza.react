import { DatePicker, Form, Input, Select, Space } from "antd";
import { useEffect } from "react";
import { useGraph, useModel } from "../../hook/VistaHook";
import { FormixItem } from "../../components/Formix";
import { SelectFilter } from "../../components/InputFilter";
import { LocalityModel } from "../../models/person";

export function Address({direction, children, source, form, vid, ...info}) {
    
    direction = direction || "horizontal";
    const [model] = useModel(vid);
    const options = useGraph(LocalityModel, "search",[]); // devo poter distiguere da un altro

    console.log("ADDRESS", options);

    useEffect(()=>{
        if(form){
            form.observe("locality", "onselect").hasValue().make((info)=>{ //individua autonomamente form a cui view appartiene?
                console.log("LOCALITY OBSERVER", info);
                const data = info.data;
                form.setValue("city", data.city);
                form.setValue("country", data.country);
                form.setValue("code", data.code);
            });
        }
    }, [form]);

    const ondigits = info.ondigits || ((v) => {
        //model.Publish("LOCALITY-REQ",v); //E se voglio eseguire qualcosa dopo
        console.log("comuni search", v);
        model.read(LocalityModel, m => m.search(v));
    });

    const content = <>
    <FormixItem name="street">
        <Input placeholder="Indirizzo Residenza" style={{width: '390px'}}/>
    </FormixItem>
    <FormixItem name="street_num">
        <Input placeholder="Numero Civico" style={{width: '390px'}}/>
    </FormixItem>
    <FormixItem name="locality">
        <SelectFilter options={options.data} onDigits={ondigits} placeholder="Comune Residenza" style={{width: '350px'}} />
    </FormixItem>
    <FormixItem name="city">
        <Input disabled={true} placeholder="Provicia" style={{width: '80px'}}/>
    </FormixItem>
    <FormixItem name="code">
        <Input placeholder="CAP" style={{width: '80px'}}/>
    </FormixItem>
    <FormixItem name="country">
        <Input disabled={true} placeholder="Stato" style={{width: '80px'}}/>
    </FormixItem>
</>;

    return (
        direction === "horizontal"
        ? <Space>{content}{children}</Space>
        : <>{content}{children}</>
    )
}