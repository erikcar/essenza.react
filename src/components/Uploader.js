import { Button, message, Upload } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { useControl } from "../index";

function Controller(c) {
    c.skin = Uploader;
    c.command = {

    }
}

//file.type === 'image/jpeg' || file.type === 'image/png' || file.type === "application/pdf"
const MimeTypes = {png: "image/png", jpg: "image/jpeg", pdf: "application/pdf"}

export function Uploader({ data, url, onSuccess, onChange, restrictTo, fileList, thumbUrl, children, ...rest }) {
    const [control] = useControl(Controller);
    const [files, setFiles] = useState(() => {
        if(fileList && fileList.length>0){
            fileList.forEach((file)=>{
                if(file.ext === '.pdf') file.thumbUrl = thumbUrl || '/icon/pdf.svg';
            })
        }
        return fileList
    });

    if (!url) {
        throw new Error("Uploader must define Url to upload.")
    }

    console.log("FILES", fileList, files);

    data = useMemo(() => {
        const d = data || {};
        d.url = url;
        if(!d.option) d.option = {};
        d.option.onSuccess = (r, file) => {
            if(onSuccess) onSuccess(r, file);
            message.success("Documneto caricato con successo!");
            console.log("Upload ok", r);
        };
        return d;
    }, [data, url, onSuccess])

    useEffect(()=>setFiles(fileList),[fileList]);

    const onchange = ({ file, fileList  }) => {
        console.log("UPLOAD CHANGED: ", file, fileList );
        if(onChange) onChange({ file: file, fileList: fileList  });
        setFiles(fileList );

        /*if (file.status === "uploading") {
            // file.status = "done";
            file.itype = data.current.itype;

        }
        else if (file.status === "removed") {

        }*/
    };

    const ibeforeUpload = (file) => {
        if (restrictTo) {
            const ar = restrictTo.split(',');
            for (let k = 0; k < ar.length; k++) {
                if (file.type === MimeTypes[ar[k].trim().toLowerCase()]) return true;
            }
            control.openPopup(<div>Formato file non supporto. Formati supportati {restrictTo}.</div>)
            return Upload.LIST_IGNORE;
        }

        return true;
    };

    return <Upload {...rest} beforeUpload={ibeforeUpload} listType='picture'
        data={data}
        fileList={files}
        onChange={onchange}
        customRequest={control.upload}>{children}</Upload>
}