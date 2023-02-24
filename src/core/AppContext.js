//import { VistaApp } from '@essenza/core';
import { VistaApp, DataGraph, AppModel } from '@essenza/core';
import React, { useEffect, useState, useRef, Children } from 'react';
import { useNavigate, useSearchParams, BrowserRouter, Routes } from 'react-router-dom';
import { PopUp, PopupManager } from '../components/Popup';
import { useBreakPoint } from '../hook/SystemHook';

//import { useNavigate, useSearchParams } from 'react-router-dom';


export const AppContext = React.createContext(null);

//Posso fare un object login {component: , request: , path: } oppure scelgo in base a tipo login (React component, function or string)
export const AppRoot = ({ init, onload, schema, onlogin, baseurl, control, children, navigator, qp, dev, token, breakpoint, noErrorHandler }) => {

    console.log("APP PROVIDER");

    //const navigator = useNavigate();dev
    //const [qp] = useSearchParams(); 
    console.log("APP PROVIDER NAV", VistaApp);
    const [app, updateApp] = useState(() => {
        return VistaApp.init(navigator, control, onlogin, PopupManager);
        //return Vist
    });
    console.log("APP PROVIDER STATE", app, VistaApp);
    if (qp) {
        if (qp.has("fareq"))
            app.irequest = { type: 'FA', data: qp };
        else if (qp.has("emreq"))
            app.irequest = { type: 'EM', data: qp };
        else if (qp.has("loginreq"))
            app.irequest = { type: 'LOG', data: qp };

        app.qp = qp;
    }

    //app.size = useBreakPoint(breakpoint, app);
    //console.log("APP-PROVIDER-BP", app.size);
    if (token) {
        token.current = app;
    }
    const oninit = useRef(() => {
        //Devo scambiare ordine??? cioè prima faccio check session?
        if (init)
            init(VistaApp);
        if (!VistaApp.irequest && !dev)
            app.model.request(AppModel, m => m.checkSession(app));
    });

    console.log("APP PROVIDER", app);

    if (schema && !DataGraph.schema.DEFAULT) schema(app);

    if (!app.initialized) {

        VistaApp.refresh = () => {
            updateApp({ ...VistaApp });
        }

        //VistaApp.icontainer.service.IPopup = PopupManager;
        //Prima di init e che avvenga prima chiamata api
        if (!noErrorHandler) {
            VistaApp.icontainer.service.IApi.onManagedError = e => {
                console.log("MANAGED ERROR", e);
                VistaApp.control.openPopup(<div>{e.message}</div>, "ATTENZIONE");
            }

            VistaApp.icontainer.service.IApi.onError = e => {
                console.log("APIX ERROR", e);
                if (e.type === "REQUEST")
                    VistaApp.control.openPopup(<div>Problema di comunicazione, controllare la connessione. Se il problema persiste riavviare l'applicazione.</div>, "ATTENZIONE");
                else if (e.type === "RESPONSE") {
                    if (e.response.status === 401) {
                        VistaApp.control.openPopup(<div>Sessione scaduta o permessi non sufficienti per visualizzare le informazione.</div>, "ATTENZIONE");
                        setTimeout(() => {
                            VistaApp.control.navigate("login");
                        }, 3400);
                    }
                    else {
                        VistaApp.control.openPopup(<div>Si è verificato un problema, riprovare tra qualche istante. Se il problema persiste riavviare l'applicazione.</div>, "ATTENZIONE");

                    }
                }
                else if (e.type === "CALL")
                    VistaApp.control.openPopup(<div>Si è verificato un problema tecnico. Si prega di riavviare l'applicazione.</div>, "ATTENZIONE");
            }
        }

        if (baseurl) VistaApp.icontainer.service.IApi.channel.setBaseurl(baseurl);
        //axios.defaults.withCredentials = true;
        app.initialized = true;
        if (onload) onload(app);
    }

    useEffect(() => {
        VistaApp.current = app;
    }, [app]);

    useEffect(() => {
        oninit.current();
        if (VistaApp.irequest && VistaApp.irequest.type === "LOG") {
            let session = localStorage.getItem("_session");
            console.log("SESSION-LOGIN", session);
            if (session) {
                localStorage.removeItem("_session");
                VistaApp.login(JSON.parse(session));
            }
        }
        /*if(dev)
            VistaApp.onlogin(VistaApp);*/
    }, []);



    return (
        <AppContext.Provider value={app} >
            {children}
            <PopUp />
        </AppContext.Provider>
    )
}

/*export function AppRoot({ basename, children, ...rest}) {
    return 
        <AppProvider {...rest} content={children}>

        </AppProvider>
}*/
export const useApp = () => React.useContext(AppContext)?.current || VistaApp;