import { useState, useEffect, useRef } from 'react';
import { VistaApp, DataGraph, DataSource } from '@essenza/core';

export const useGlobal = (key, initialState)=>{
  const [state, setState] = useState(DataGraph.getGlobalState(key) || initialState);
  
  useEffect(()=>{
    console.log("EFFECT D-GLOBAL");
    DataGraph.registerGlobalState(key, state, setState);
    return () => DataGraph.unregisterGlobalState(key);
  },[]);

  return [state, setState];
}

/*export const useModelState(model, initialState){
  let state
  [state, model.setState] = useState(initialState);
}*/

export const useGraph = (model, path, initialData) => {

  const [source, setSource] = useState(
    () => {
      const ic = VistaApp.icontainer;
      let sourcePath;
      if(Object.prototype.toString.call(model) === "[object String]")
        sourcePath = model;
      else
        sourcePath = ic.ResolveClass(model).etype + "." + path;
      console.log("DATA-DEBUG useGraph SOURCE: ", sourcePath);
      let node;
      if (!initialData) {
        node = DataGraph.findOrCreateGraph(sourcePath);
      }
      if (!node) {
        node = DataGraph.setSource(sourcePath, initialData);
      }
      console.log("DATA-DEBUG useGraph SOURCE: ", sourcePath, node);
      
      return node.datasource;
    });

    const initialized = useRef(false)

    if(!initialized.current){
      source.node.observe(setSource);
      initialized.current = true;
    }

  useEffect(() => {
    console.log("TEST EFFECT MODEL IN useSource", source.node);
    //source.node.observe(setSource);
    return () => {
      console.log("UNOBSERVE", source.node);
      source.node.unobserve(setSource);
      if(!source.node.permanent){
        //NON DEVO CONTROLLARE CHE NON CI SIA NESSUN ALTRO OBSERVER PRIMA DI RESET SOURCE ???
        source.node.source = null;
        //NON DEVO FARE UNREGISTER DI GRAPH???
        //DataGraph.unregisterGraph(source.node.graph.getKey());
        console.log("UNOBSERVE-FREESOURCE", source.node.etype, source.node.name);
      }
        
      //if(!permanent) node.setSource(null, null, false, true);
    } //TODO: model.strategy per ogni dataSource
  }, [source.node]);

  return source;
}

export function useNode(parent, name, defaultValue, predicate){

}

export function useSource(data, node){
  const source = useRef(new DataSource(data, node));
  source.current.data = data;
  return source.current;
}