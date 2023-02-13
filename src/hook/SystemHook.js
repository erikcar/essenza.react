import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { VistaContext } from "../components/Vista";
import { useApp } from "../core/AppContext";
import { Context, EntityModel, VistaApp } from "@essenza/core";

/**
 * 
 * @param {Controller} controller 
 * @param {Context} ctx 
 * @returns {[Controller]}
 */
export function useControl(controller, ctx) { //Add useModelContext()
    const context = useContext(VistaContext) || ctx || VistaApp.context;
    console.log("USE MODEL", context, controller);
    const c = context.getControl(controller);
    return [c];//[m, source];
}

export function useModel(skin, controller, vid, ctx){
    const model = useRef(new EntityModel(vid)).current;
    const context = useContext(VistaContext) || ctx || VistaApp.context;

    [model.state.__val, model.state.__refresh] = useState(false);

    useEffect(()=>{
        context.register(skin, model);
        return () => context.unregister(skin, model);
    },[context]);

    model.control = context.controls.get(skin);

    if(!model.control){
        model.control = context.setController(skin, controller, true);
    }

    return [model, model.control, model.state];
}

export function useVista(skin, controller, contextName) {
    //ContextName ?
    const context = useRef(new Context(contextName || controller.name));
    const [m, c, s] = useModel(skin, controller, null, context.current); 
    /*const [m] = useModel();
    c.model = m;*/
    console.log("USE VISTA:", c);
    return [context.current, m, c, s];
}

export function useBreakPoint(size){
    let app = useApp(); //|| VistaApp;
    const bp = app.breakpoint;
    const [breakpoint, setBreakpoint] = useState(bp.getState());
    if(size)
        bp.register(size, setBreakpoint);
    return breakpoint;
}

/*export function useVista(controllerType, info, name) {
    const context = useRef(new Context(name || controllerType.name));
    //graph.context = context.current;
    //useControl(controller)
    const [c] = useControl(controllerType, context.current); 
    console.log("USE VISTA:", c);
    return [context.current, c];
}*/
