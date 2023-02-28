import{getConfig as u}from"typesafe-i18n/config";var g=(...e)=>e.map(t=>{for(;t.startsWith("/");)t=t.substring(1);for(;t.endsWith("/");)t=t.substring(0,t.length-1);return t}).join("/");async function w({config:e,$fs:t,$import:r}){let n=await u(t),i=[];for(let s of e.languages){let o=await m(t,r,n.outputPath,s);i.push(l(o,s))}return i}var m=async(e,t,r,n)=>{let a=(await e.readFile(g(r,`${n}/index.ts`),"utf-8")).toString().split(`
`).filter(p=>!p.trim().startsWith("import ")).join(`
`).replace(/:.*=/g," =").replace(/ satisfies.*\/n/g,`
`);await e.writeFile(`${n}.temp.js`,a);let c=(await t(`${n}.temp.js`)).default;return await e.rm(`${n}.temp.js`),c},l=(e,t)=>({type:"Resource",languageTag:{type:"LanguageTag",name:t},body:Object.entries(e).map(([r,n])=>y(r,n))}),y=(e,t)=>({type:"Message",id:{type:"Identifier",name:e},pattern:{type:"Pattern",elements:[{type:"Text",value:t}]}});async function h({$fs:e,config:t,resources:r}){let n=await u(e);for(let i of r){let s=i.languageTag.name,o=f(i),a=s===t.referenceLanguage?"BaseTranslation":"Translation",c=`import type { ${a} } from './${g(n.outputPath,n.typesFileName)}'

const ${s}: ${a} = ${o}

export default ${s}`;await e.writeFile(`${s}.ts`,c)}}var f=e=>{let t=Object.fromEntries(e.body.map(R));return JSON.stringify(t,null,3)};function R(e){return[e.id.name,e.pattern.elements[0].value]}export{w as readResources,h as writeResources};
