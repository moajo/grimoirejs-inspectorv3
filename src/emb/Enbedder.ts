export default function embed(url:string){
    const scriptTag = document.createElement("script");
    scriptTag.setAttribute("type", "text/javascript");
    scriptTag.setAttribute("x-injectedBy", "Grimoire.js inspector v3");
    scriptTag.setAttribute("src", url);
    document.body.appendChild(scriptTag);
}