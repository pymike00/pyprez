/*
Pyodide is undeniably cool, and useful in niche cases. Pyscript is easy to use, but is bulky, slow, not especially
easy to develop on, and is not really necessary seeing as 95+% of its utility comes from Pyodide. With Pyprez,
99.9+% of utility comes from Pyodide. We're not claiming to do anything better, its just a simple script to get you
started with exploring Pyodide's capabilities.

This js file will import pyodide and codemirror dependencies for you, so all you need to do is import this
<script src="https://modularizer.github.io/pyprez/pyprez.js" mode="editor">
    import numpy as np
    print("testing")
    np.random.rand(5)
</script>
*/
/* ___________________________________________ CONFIG _________________________________________________ */
let pyprezConfig = {
    importCodeMirror: true,
    codemirrorCDN: "https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/",
    loadedCodeMirrorStyles: ["default"],
    
    importPyodide: true,
    pyodideCDN: "https://cdn.jsdelivr.net/pyodide/v0.20.0/full/pyodide.js",
}
for (let [k, v] of Object.entries(pyprezConfig)){
    if (window[k] === undefined){
        window[k] = v
    }
}


/* ___________________________________________ DEFERRED PROMISES _________________________________________________ */
class DeferredPromise{
    constructor(){
        this.fulfilled = false
        this.rejected = false
        this.promise = new Promise((resolve, reject)=>{
            this._resolve = resolve
            this._reject = reject
        })
    }
    resolve(){
        this._resolve().then((()=>{this.fulfilled=true}).bind(this))
    }
    reject(){
        this._reject().then((()=>{this.rejected=true}).bind(this))
    }
    then(onfulfilled, onrejected){return this.promise.then(onfulfilled, onrejected)}
    catch(onrejected){return this.promise.catch(onrejected)}
}
let domContentLoaded = new DeferredPromise();
let codemirrorImported = new DeferredPromise();
let pyodideImported = new DeferredPromise();
let pyprezScript = document.currentScript;
document.addEventListener('DOMContentLoaded', domContentLoaded.resolve)

if (document.readyState === "complete" || document.readyState === "loaded") {
     // document is already ready to go
     domContentLoaded.resolve()
}

/* ___________________________________________ DEFINE DEPENDENCIES _________________________________________________ */
let jsDependencies = {
    codemirror: {
        src: codemirrorCDN + "codemirror.min.js",
        check: ()=>{
            if (!window.importCodeMirror){return true}
            if (!window.CodeMirror){return false}
            return true
        },
        tree: {
            codemirrorPython: {
                src: codemirrorCDN + "mode/python/python.min.js",
                check: ()=>{
                    if (!window.importCodeMirror){return true}
                    if (!window.CodeMirror){return false}
                    if (!window.CodeMirror.modes){return false}
                    if (!window.CodeMirror.modes.python){return false}
                    return true
                },
                then: codemirrorImported.resolve,
            },
        }
    },
    pyodide: {
        src: pyodideCDN,
        check: ()=>{
            if (!window.importPyodide){return true} 
            return window.loadPyodide
        },
        then: pyodideImported.resolve,
    },
}
let cssDependencies = [
    codemirrorCDN + "codemirror.min.css"
]

/* ___________________________________________ INTERPRET SCRIPT TAG _________________________________________________ */
function loadScriptAsElement(script=document.currentScript, mode="editor", theme="default", runonload=false){
    script.display = "none";

    // make a github img link
    let a = document.createElement("a");
    a.href="https://modularizer.github.io/pyprez"
    a.innerHTML = `<img src="https://github.com/favicon.ico" height="15px"/>`

    // add a real pyprez custom-element
    if (script.hasAttribute("mode")){
        mode = script.getAttribute("mode")
    }
    let el = document.createElement("pyprez-" + mode);
    el.innerHTML = script.innerHTML;
    runonload = pyprezScript.hasAttribute("runonload")?pyprezScript.getAttribute("runonload"):runonload
    if (mode === "editor"){
        el.setAttribute("runonload", runonload)
    }

    if (script.hasAttribute("theme")){
        theme = els.getAttribute("theme")
    }
    el.setAttribute("theme", theme)

    // add to container
    let div = document.createElement("div");
    div.append(a);
    div.append(el);

    // insert into document after script
    script.after(div);

    // remove script content
    script.innerHTML = ""
}


// if the user is using the script tag as a code block, add a real code block to the document
if (document.currentScript.innerHTML){
    let convert = pyprezScript.hasAttribute("convert")?pyprezScript.getAttribute("convert")==="true":true
    if (convert){
        loadScriptAsElement(document.currentScript)
    }
}else{
    domContentLoaded.then(()=>{
        console.log("DOMContentLoaded")
        let isFirstScript = pyprezScript === document.scripts[0]
        let scripts = document.scripts.length
        let bodyEls = document.body.children.length
        let solo = isFirstScript & (((bodyEls === 2) & (pyprezScript.parentElement === document.body)) || (bodyEls === 1))
        console.log(solo, isFirstScript, bodyEls, pyprezScript.parentElement)
        let convert = pyprezScript.hasAttribute("convert")?pyprezScript.getAttribute("convert")==="true":solo
        let runonload = pyprezScript.hasAttribute("runonload")?pyprezScript.getAttribute("runonload"):"true"
        let mode = pyprezScript.hasAttribute("mode")?pyprezScript.getAttribute("mode"):"editor"
        let theme = pyprezScript.hasAttribute("theme")?pyprezScript.getAttribute("theme"):"default"
        let githublink = pyprezScript.hasAttribute("githublink")?pyprezScript.getAttribute("githublink"):"true"
        let lastScript = document.scripts[document.scripts.length - 1]
        if (convert){
            let demoCode = lastScript.innerHTML.trim()
//            loadScriptAsElement(lastScript);
            let stackEditor = document.createElement("div");
            document.body.appendChild(stackEditor);
            stackEditor.outerHTML = `
                <pyprez-${mode} runonload="${runonload}" theme="${theme}" githublink="${githublink}">${demoCode}</pyprez-${mode}>
            `;
        }
    })
}

// allow importing this script multiple times without raising an error
if (!window.pyprezInitStarted){ // if this script has not already run
var pyprezInitStarted = true;// save this window variable to signal that this script has run

/* ___________________________________________ LOAD DEPENDENCIES ____________________________________________________ */
// allow disabling dependency import if desired (people may want to do their own imports for clarity, speed, or to
// tool to add css to document
function addStyle(s){
    let style = document.createElement("style");
    style.innerHTML = s;
    document.head.appendChild(style);
}

// tools to import js dependencies
function importScript(url){
    let el = document.createElement("script");
    el.src = url;
    return new Promise((resolve, reject)=>{
        domContentLoaded.then(()=>{
            console.log("attempting to import ", url)
            document.body.appendChild(el)
            el.addEventListener("load", ()=>resolve(url))
        })
    })
}

// function to get the text of css dependencies
function get(src){return fetch(src).then(r=>r.text())}

// function to load an external .css document into the page
function importStyle(url){
    console.log("importing", url)
    return get(url).then(addStyle)
}

// recursively load dependency tree
function _loadDependencies(tree){
    for (let [k, v] of Object.entries(tree)){
       if ((!v.check) || (!v.check())){// if there is no check or the check fails, then import
            console.log("importing", k)
            importScript(v.src).then(()=>{
                console.log("imported", k)
                if (v.tree !== undefined){
                    console.log("loading nested dependencies", v.tree)
                    _loadDependencies(v.tree)
                }else if (v.then){
                    console.log("calling", v.then)
                    v.then(k);
                }else{
                    console.log("done loading", k)
                }
            }).catch(()=>{console.error("error importing", k)})
       }else{ // otherwise resolve
            console.log("passed importing", k)
            if (v.tree !== undefined){
                console.log("loading nested dependencies", v.tree)
                _loadDependencies(v.tree)
            }else if (v.then){
                console.log("calling", v.then)
                v.then(k);
            }else{
                console.log("done loading", k)
            }
       }
    }
}

// recursively load dependency tree
function loadDependencies(){
    // try to load css dependencies but don't wait on them
    cssDependencies.map(importStyle)
    addStyle('.CodeMirror { border: 1px solid #eee !important; height: auto !important; }')

    // loading js dependencies will cause deferred promises to resolve
    _loadDependencies(jsDependencies)
}
loadDependencies(jsDependencies);
/* _______________________________________ LOAD AND EXTEND PYODIDE FUNCTIONALITY ____________________________________ */
class PyPrez{
    /*class which loads pyoidide and provides utility to allow user to load packages and run code as soon as possible
    examples:
        var pyprez = new Pyprez();

        // use pyodide as soon as it loads
        let promiseToFour = pyprez.then(pyodide => {
                console.log("pyodide has loaded");
                return pyodide.runPython("2+2")
            });

        // load dependencies and run some code as soon as it loads
        let promiseToRandom = pyprez.loadAndRunAsync(`
                import numpy as np
                np.random.rand(5)
            `);

        //reroute stdout to a new javascript function
        pyprez.stdout = alert;
        pyprez.loadAndRunAsync(`print("testing if this alerts on window")`);
    */
    constructor(config={}){
        // bind the class methods to this instance
        this.load = this.load.bind(this);
        this.loadAndRunAsync = this.loadAndRunAsync.bind(this);

        // create a deferred promise that will be resolved later with the pyodide object
        this.promise = new Promise((resolve, reject)=>{this._resolvePromise = resolve; this._rejectPromise = reject;})

        this._loadPyodide = this._loadPyodide.bind(this)
        // load pyodide and resolve the promise
        this._loadPyodide(config);
    }
    elementList = [];
    elements = {};

    addElement(el){
        this.elements[this.elementList.length] = el;
        this.elementList.push(el);
        if (el.id){
            this.elements[el.id] = el;
        }
    }
    
    // set the functions that will handle stdout, stderr from the python interpreter
    stdout = console.log
    stderr = console.error

    // utility methods used to load requirements and run code asynchronously as soon as pyodide is loaded
    load(code, requirements="detect"){
        /*load required packages as soon as pyodide is loaded*/
        return this.then(pyodide =>{
            let requirementsLoaded;
            if (requirements === "detect"){
                if (code){
                    console.debug("auto loading packages detected in code")
                    console.debug(code)
                    requirementsLoaded = pyodide.loadPackagesFromImports(code)
                }
            }else{
                console.debug("loading", requirements)
                requirementsLoaded = pyodide.loadPackage(requirements);
            }
            return requirementsLoaded
        })
    }
    loadAndRunAsync(code, requirements="detect"){
        /* run a python script asynchronously as soon as pyodide is loaded and all required packages are imported*/
        return this.then(pyodide =>{
            if (code){
                return this.load(code, requirements)
                    .then(r => this._runPythonAsync(pyodide, code))
                    .catch(e => this._runPythonAsync(pyodide, code))
            }
        })
    }
    _runPythonAsync(pyodide, code){
        if (code){
            console.debug("running code asynchronously:")
            console.debug(code)
            return pyodide.runPythonAsync(code).catch(this.stderr)
        }
    }

    // allow pyprez object to act a bit like a the promise to the pyodide object
    then(successCb, errorCb){return this.promise.then(successCb, errorCb)}
    catch(errorCb){return this.promise.catch(errorCB)}

    _loadPyodide(config={}){
        /*load pyodide object once pyodide*/
        pyodideImported.then((()=>{
            setTimeout((()=>{
                // setup the special config options to load pyodide with
                let defaultConfig = {
                    stdout: (t=>{this.stdout(t)}).bind(this),
                    stderr: (t=>{this.stderr(t)}).bind(this),
                }
                config = Object.assign(defaultConfig, config)
                // load pyodide then resolve or reject this.promise
                loadPyodide(config).then(this._resolvePromise).catch(this._rejectPromise);
            }).bind(this), 10)
        }).bind(this))
        this.then(this._onload.bind(this));
        return this._pyodidePromise
    }
    _onload(pyodide){
        /*set the window variable and the class attribute of pyodide as soon as pyodide is loaded*/
        console.timeEnd("pyodide load");
        window.pyodide = pyodide;
        this.pyodide = pyodide;
    }
}
var pyprez = new PyPrez();

/* ___________________________________________________ IMPORT ___________________________________________________ */
class PyPrezImport extends HTMLElement{
    /*
    custom element with the <pyprez-import></pyprez-import> tag which is used to load required packages into pyodide

    examples:
        <pyprez-import>
            numpy
            matplotlib
        </pyprez-import>
        <pyprez-import>
            -scipy
            -asyncio
        </pyprez-import>
        <pyprez-import src="requirements.txt"></pyprez-import>
    */
    constructor(){
        super();
        this.classList.add("pyprez");
        this.style.display = "none";
        let requirements = [...this.innerText.matchAll(this.re)].map(v=>v[1]);
        if (requirements.length){
            console.debug("importing requirements ", requirements, " from <pyprez-import/>", this)
            pyprez.then(pyo=>pyo.loadPackage(requirements)).then(()=>{
                console.timeEnd("pyprez-import load")
            });
        }
        pyprez.addElement(this);
    }
    re = /\s*-?\s*(.*?)\s*[==[0-9|.]*]?\s*[,|;|\n]/g
}
window.addEventListener("load", ()=>{
    customElements.define("pyprez-import", PyPrezImport);
})

/* ___________________________________________________ SCRIPT ___________________________________________________ */
class PyPrezScript extends HTMLElement{
    /*
    custom element which loads required packages and runs a block of python code in the pyodide interpreter

    example:
        <pyprez-script>
            import numpy as np
            np.random.rand(5)
        </pyprez-script>
        <pyprez-script src="my-script.py"></pyprez-script>
    */
    constructor(){
        super();
        this.classList.add("pyprez");
        this.style.display = "none";
        this.run = this.run.bind(this);
        if (this.hasAttribute("src") && this.getAttribute("src")){
            console.debug("fetching script for pyprez-script src", this.getAttribute("src"))
            fetch(this.getAttribute("src")).then(r=>r.text()).then(this.run)
        }else{
            this.run(this.innerHTML);
        }
        pyprez.addElement(this);
    }
    run(code){
        console.debug("running code from <pyprez-script>", code, this)
        this.innerHTML = code;
        this.promise = pyprez.loadAndRunAsync(code).then(v=>this.value=v?v.toString():"")
        return this.promise
    }
}
window.addEventListener("load", ()=>{
    customElements.define("pyprez-script", PyPrezScript);
})

/* ___________________________________________________ EDITOR ___________________________________________________ */
class PyPrezEditor extends HTMLElement{
    /*
    custom element which allows editing a block of python code, then when you are ready, pressing run to
    load required packages and run the block of python code in the pyodide interpreter and see the result

    example:
        <pyprez-editor>
            import numpy as np
            np.random.rand(5)
        </pyprez-editor>
        <pyprez-editor src="my-script.py"></pyprez-editor>
    */
    constructor(){
        super();
//        alert("loading" + this.innerHTML)
//        console.log("this=", this)
        this.classList.add("pyprez");
        this.loadEl = this.loadEl.bind(this);
        this.loadEditor = this.loadEditor.bind(this);
        this.language = "python"
        if (this.hasAttribute("language") && this.getAttribute("language")){
            this.language = this.getAttribute("language").toLowerCase()
        }
        if (!this.hasAttribute("stdout")){
            this.setAttribute("stdout", "true")
        }
        let aliases = {
            "py": "python",
            "js": "javascript",
        }
        if (aliases[this.language]){
            this.language = aliases[this.language]
        }

        if (this.hasAttribute("src") && this.getAttribute("src")){
            let src = this.getAttribute("src")
            console.debug("fetching script for pyprez-editor src", src)
            if (src.endsWith('.js')){
                this.language = "javascript"
            }
            fetch(src).then(r=>r.text()).then(code =>{
                this.innerHTML = code;
                this.loadEl();
            })
        }else{
            this.loadEl();
        }
        this.addEventListener("keydown", this.keypressed.bind(this));
        pyprez.addElement(this);
        if (this.hasAttribute("theme")){
            this.theme = this.getAttribute("theme")
        }
        this.addEventListener("dblclick", this.dblclicked.bind(this))
        if (this.hasAttribute("runonload") & (this.getAttribute("runonload")==="true")){
            this.run();
        }
    }
    keypressed(e){
        if (e.shiftKey){
            if (e.key == "Enter"){this.run(); e.preventDefault();}
            else if (e.key == "Backspace"){this.reset(); e.preventDefault();}
        }
    }
    dblclicked(e){
        console.log("double clicked")
        this.run();
    }
    loadEl(){
        let code="";
        if (this.innerHTML){
            let lines = this.innerHTML.replaceAll("\t","    ").split("\n")
            let indent = " ".repeat(Math.min(...lines.filter(v=>v).map(v=>v.match(/\s*/)[0].length)));
            code = lines.map(v=>v.startsWith(indent)?v.replace(indent, ""):v).join("\n")
        }

        this.initialCode = code;
        console.log("initial code", this.initialCode)
        this.innerHTML = `<pre>${code}</pre>`
        this.loadEditor();
    }
    loadEditor(){
        this._loadEditor();
        codemirrorImported.then(this._loadCodeMirror.bind(this));
    }
    _loadEditor(){
    // ➤ is &#10148;
        let githublink = this.hasAttribute("githublink")?this.getAttribute("githublink")==="true":false
        let gh = githublink?'<a href="https://modularizer.github.io/pyprez"><img src="https://github.com/favicon.ico" height="15px"/></a>':"<div></div>"

        this.innerHTML = `
        <div style="color:green">&#10148;</div>
        <div style="background-color:#d3d3d3;border-color:#808080;border-radius:3px;display:flex">
            ${gh}
            <div style="margin-left:10px;overflow:hidden;"></div>
        </div>
        <textarea style="height:auto;width:auto;">${this.initialCode}</textarea>
        `
        this.start = this.children[0]
        this.messageBar = this.children[1].children[1]
        if (!pyodideImported.promise.fullfilled){
            this.message = "Loading pyodide"
            pyodideImported.then((()=>{this.message = "Ready   (Double-Click to Run)"}).bind(this))
        }
        this.textarea = this.children[2]
        this.textarea.style.height = this.textarea.scrollHeight +"px"

        console.log("initial code", this.initialCode.split("\n").map(v=>v.length).reduce((a,b)=>a>b?a:b))
        let longestLine = this.initialCode.split("\n").map(v=>v.length).reduce((a,b)=>a>b?a:b)
        let fontSize = 1 * window.getComputedStyle(this.textarea).fontSize.slice(0,-2)
        let w = Math.ceil(longestLine * fontSize * 0.7)
        console.log(longestLine, fontSize, w + "px")
        this.textarea.style.width = w  + "px"
        console.log(this.textarea.style.width, this.textarea)

        codemirrorImported.then((()=>{this.loadPackages()}).bind(this));
        this.start.addEventListener("click", this.startClicked.bind(this))
        if (window.CodeMirror){
        }
    }
    _loadCodeMirror(){
        this.editor = CodeMirror.fromTextArea(this.textarea, {
            lineNumbers: true,
            mode: this.language,
            viewportMargin: Infinity,
            gutters: ["Codemirror-linenumbers", "start"],
        });
        this.editor.on("keydown", this.loadPackages.bind(this));
        this.editor.doc.setGutterMarker(0, "start", this.start);

        console.log("attaching dblclick", this.editor.display.lineDiv)
        this.editor.display.lineDiv.addEventListener("dblclick", this.dblclicked.bind(this))
    }
    get message(){
        return this.messageBar.innerHTML
    }
    set message(v){
        this.messageBar.innerHTML = v
    }
    get code(){
        return this.editor?this.editor.getValue():this.textarea.value
    }
    set code(v){
        if (this.mode == "html"){
            v = v.replaceAll("<", "&lt").replaceAll(">", "gt")
        }
        if (this.editor){
            this.editor.setValue(v);
            this.editor.doc.setGutterMarker(0, "start", this.start);
            let si = this.editor.getScrollInfo();
            this.editor.scrollTo(0, si.height)
        }else{
            this.textarea.value = v;
            this.textarea.scrollTop = this.textarea.scrollHeight;
        }
    }
    get theme(){return this.editor.options.theme}
    set theme(v){
        codemirrorImported.then((()=>{
            if (window.loadedCodeMirrorStyles.includes(v)){
                this.editor.setOption("theme", v)
            }else{
                let src = codemirrorCDN + "theme/" + v + ".min.css"
                get(src).then(addStyle).then((()=>{
                    this.editor.setOption("theme", v);
                    window.loadedCodeMirrorStyles.push(v);
                }).bind(this))
            }
        }).bind(this))
    }
    numImports = 0;
    loadPackages(){
        let code = this.code;
        let n = code.match(/import/g);
        if (n && n.length !== this.numImports){
            this.message = "Loading packages..."
            this.numImports = n.length;
            pyprez.load(this.code).then((()=>{this.message = "Ready...(Double-Click to Run)"}).bind(this))
        }
    }
    executed = false
    startClicked(){
        if (!this.executed){
            this.run();
        }else{
            this.reload();
        }
    }
    run(){
        if (this.code){
            let sep = "\n____________________\n"
            this.message = "Running..."
            this.executed = this.code.split(sep)[0];
            this.start.style.color = "yellow"
            this.code = this.executed;
            let code = this.executed;
            let promise;
            if (this.language == "python"){
                this.code += sep;
                if (this.getAttribute("stdout") === "true"){
                    this.attachStd();
                }

                promise = pyprez.loadAndRunAsync(code);
                promise.then(r=>{
                    this.message = "Complete! (Double-Click to Re-Run)"
                    this.code += "\n>>> " + (r?r.toString():"");
                    this.start.style.color = "red";
//                    this.start.innerHTML = "↻";
                    this.start.innerHTML = "&#8635";
                    if (this.getAttribute("stdout") === "true"){
                        this.detachStd();
                    }
                    return r
                })
            }else if (this.language == "javascript"){
                let r = eval(code)
                this.code += "\n>>> " + JSON.stringify(r, null, 2);
                this.start.style.color = "red";
//                this.start.innerHTML = "↻";
                this.start.innerHTML = "&#8635";
                return r
            }else if (this.language == "html"){
                if (!this.htmlResponse){
                    this.htmlResponse = document.createElement("div");
                    this.after(this.htmlResponse)
                }
                this.htmlResponse.innerHTML = this.code.replaceAll("&lt","<").replaceAll("&gt", ">");
            }
        }

    }
    appendLine(v){
        this.code += "\n" + v
    }
    attachStd(){
        this.oldstdout = pyprez.stdout
        this.oldstderr = pyprez.stderr
        pyprez.stdout = this.appendLine.bind(this)
        pyprez.stderr = this.appendLine.bind(this)
    }
    detachStd(r){
        pyprez.stdout = this.oldstdout
        pyprez.stderr = this.oldstderr
        return r
    }
    reload(){
//        this.start.innerHTML = "➤";
        this.start.innerHTML = "&#10148";
        this.start.style.color = "green";
        this.code = this.executed;
        this.executed = false;
    }
}
window.addEventListener("load", ()=>{
customElements.define("pyprez-editor", PyPrezEditor);
})

/* ___________________________________________________ CONSOLE ___________________________________________________ */
class PyPrezConsole extends HTMLElement{
    /*
    simple and customizable Python REPL terminal emulator

    examples:
        <pyprez-console></pyprez-console>
        <pyprez-console style="background-color:yellow;color:black"></pyprez-console>
    */
    constructor(){
        super();
        this.classList.add("pyprez");
        this.attachStd = this.attachStd.bind(this)
        this.detachStd = this.detachStd.bind(this)
        this.id = 'console' + Math.floor(10000*Math.random())
        let cols = this.hasAttribute("cols")?this.getAttribute("cols"):120
        let rows = this.hasAttribute("rows")?this.getAttribute("rows"):20
        let bg = this.style["background-color"]?this.style["background-color"]:"#000"
        let c = this.style["color"]?this.style["color"]:"#fff"


        this.language = "python"
        if (this.hasAttribute("language") && this.getAttribute("language")){
            this.language = this.getAttribute("language").toLowerCase()
        }
        let aliases = {
            "py": "python",
            "js": "javascript"
        }
        if (aliases[this.language]){
            this.language = aliases[this.language]
        }

        this.innerHTML = `<textarea cols="${cols}" rows="${rows}" style="background-color:${bg};color:${c};height:100%;"></textarea>`
        this.textarea = this.children[0]
        this.printResult = this.printResult.bind(this);
        this.eval = this.eval.bind(this);

        if (this.language === "python"){
            pyprez.loadAndRunAsync(`
                import sys
                s = f"""Python{sys.version}
                Type "help", "copyright", "credits" or "license" for more information."""
                s
            `).then(v=>{this.text = v + "\n>>> "})
        }else if (this.language === "javascript"){
            this.text += "Simple Javascript Console\n>>> "
        }

        this.textarea.addEventListener("keydown", this.keydown.bind(this));
        pyprez.addElement(this);
    }
    startup(){
        let code = `
            import sys
            s = f"""Python{sys.version}
            Type "help", "copyright", "credits" or "license" for more information."""
            s
        `
        pyprez.loadAndRunAsync(code).then(this.print)
    }
    get text(){return this.textarea.value}
    set text(v){this.textarea.value = v}
    appendLine(v){
        this.text += "\n" + v
    }
    print(v){
        this.text += v;
        this.appendLine(">>> ");
    }
    printResult(r){
        let res;
        if (this.language === "python"){
            res = r?r.toString():""
        }else{
             res = JSON.stringigy(r, null, 2)
        }
        if (!this.text.endsWith("\n")){this.text += "\n"}
        this.print("[Out] " + res)
        return res
    }
    attachStd(){
        this.oldstdout = pyprez.stdout
        this.oldstderr = pyprez.stderr
        pyprez.stdout = this.appendLine.bind(this)
        pyprez.stderr = this.appendLine.bind(this)
    }
    detachStd(r){
        pyprez.stdout = this.oldstdout
        pyprez.stderr = this.oldstderr
        return r
    }
    eval(code){
        if (this.language === "python"){
            this.attachStd()
            let r = pyprez.loadAndRunAsync(code)
            .then(this.detachStd, this.detachStd)
            .then(this.printResult)
            return r
        }else if (this.language === "javascript"){
            let r = eval(code)
            return this.printResult(r)
        }

    }
    keydown(e){
      let k = e.key;
      if (k === "Tab"){this.text += "    "; e.preventDefault();}
      if (k === "Enter"){
        if (e.shiftKey || this.text.trim().endsWith(":")){
            this.text += "\n... "
            e.preventDefault();
        }else{
            this.run();
            e.preventDefault();
        }
      }
      if (k === "Backspace" && (this.text.endsWith(">>> ") || this.text.endsWith("... "))){
        e.preventDefault();
      }
    }
    run(){
        let code = this.text.split(">>> ").pop().trim().replaceAll("...", "")
        if (!code){
            this.text += "\n>>> "
        }
        return this.eval(code)
    }
}
window.addEventListener("load", ()=>{
    customElements.define("pyprez-console", PyPrezConsole);
})



class StackOverflow extends HTMLElement{
    constructor(){
        super();
        this.classList.add("pyprez");
        if (!this.style.display){
            this.style.display = "flex"
        }
        this._header = "Run the javascript snippet below to see a runnable Python example:"
        this._code = "# your code here"
        this.innerHTML = this.getInnerHTML()
        pyprez.addElement(this);
    }
    get header(){
        return this._header
    }
    set header(header){
        this._header = header
        this.innerHTML = this.getInnerHTML()
    }
    get code(){
        return this._code
    }
    set code(code){
        this._code = code
        this.innerHTML = this.getInnerHTML()
    }
    getInnerHTML(){
        return `
<pre style="background:#d3d3d3;border-radius:0.5em;padding:1%;margin:1%;" contenteditable="true">
    <svg
        id="copy"
        height="40px"
        width="30px"
        viewBox="0 0 22 27"
        xmlns="http://www.w3.org/2000/svg"
        style="float:right;order: 2;margin-bottom:-40px;cursor:pointer;"
        onclick="navigator.clipboard.writeText(this.parentElement.innerText)">
  <g>
    <path
       style="fill:none;stroke:#000;stroke-width:1;"
       d="M 5,22 h -1 a 2 2 0 0 1 -2 -2 v -16 a 2 2 0 0 1 2 -2 h 11 a 2 2 0 0 1 2 2 v 1"
       id="bottom" />
    <rect
       style="fill:none;stroke:#000;stroke-width:1;"
       id="top"
       width="15"
       height="20"
       x="5"
       y="5"
       rx="2" />
  </g>
</svg>
${this.getRunnable()}
</pre>
        `
    }
    getRunnable(){
        return `${this.header}
&lt!-- begin snippet: js hide: false console: false babel: false --&gt

  &lt!-- language: lang-js --&gt
    # keep this comment
    ${this.code}

 &lt!-- language: lang-html --&gt

    &ltscript src="https://modularizer.github.io/pyprez/so.js"&gt&lt/script&gt

&lt!-- end snippet --&gt
</pre>`
    }
}
window.addEventListener("load", ()=>{
    customElements.define("stack-overflow", StackOverflow);
})


class StackOverflowConverter extends HTMLElement{
    constructor(){
        super();
        let ih = this.innerHTML;
        console.warn("ih=", ih)
        let mode = this.hasAttribute("mode")?`mode=${this.getAttribute("mode")}`:"";
        let src = this.hasAttribute("src")?`src=${this.getAttribute("src")}`:"";
        this.innerHTML = `
        <div style="display:flex">
            <div style="flex:50%">
                <b>Edit your python snippet here...</b>
            </div>
            <div style="flex:50%">
                <b>then copy-paste this auto-generated markdown into StackOverflow</b>
            </div>
        </div>
        <div style="display: flex">
            <div style="flex:50%">
                <pyprez-editor ${mode} ${src}>
                    ${ih}
                </pyprez-editor>
            </div>
            <div style="flex:50%">
                <stack-overflow></stack-overflow>
            </div>
        </div>
        `
        this.pyprezEditor = this.children[1].children[0].children[0]
        this.stackOverflow = this.children[1].children[1].children[0]
        this.sync()
        this.pyprezEditor.addEventListener("keydown", (()=>{setTimeout(this.sync.bind(this), 10)}).bind(this))
    }
    sync(){
        this.stackOverflow.code = this.pyprezEditor.code
    }
}
window.addEventListener("load", ()=>{
    customElements.define("stack-converter",  StackOverflowConverter);
})


}