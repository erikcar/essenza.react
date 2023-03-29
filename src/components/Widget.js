import React from "react";

function Close(){
    return null;
}

export function Widget({ children }) {

    return (<>
        {children}
        <Close />
    </>)
}