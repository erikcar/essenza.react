//import React from "react";

import React, { useEffect } from "react";
import { Button } from "antd";

export function TestComponent(){
    useEffect(()=>{
        console.log("TEST EFFECT");
    },[]) 
    return <div>TEST <Button>aaa</Button></div>;
}