var p=async e=>({baseLocale:"en",tempPath:"./node_modules/typesafe-i18n/temp-output/",outputPath:"./src/i18n/",outputFormat:"TypeScript",typesFileName:"i18n-types",utilFileName:"i18n-util",formattersTemplateFileName:"formatters",typesTemplateFileName:"custom-types",esmImports:!1,adapter:void 0,generateOnlyTypes:!1,banner:"/* eslint-disable */",runAfterGenerator:void 0,...e}),g=async e=>{let t=await e.readFile(".typesafe-i18n.json").catch(()=>"{}");return JSON.parse(t.toString())},u=async e=>{let t=await g(e);return p(t)};var l=(...e)=>e.map(t=>{for(;t.startsWith("/");)t=t.substring(1);for(;t.endsWith("/");)t=t.substring(0,t.length-1);return t}).join("/");async function b({config:e,$fs:t}){let s=await u(t),n=[];for(let a of e.languages){let r=await m(t,s.outputPath,a);n.push(f(r,a))}return n}var m=async(e,t,s)=>{let i=(await e.readFile(l(t,`${s}/index.ts`),"utf-8")).toString().split(`
`).filter(c=>!c.trim().startsWith("import ")).join(`
`).replace(/:.*=/g," =").replace(/ satisfies.*\/n/g,`
`);return(await import("data:application/javascript,"+encodeURIComponent(i))).default},f=(e,t)=>({type:"Resource",languageTag:{type:"LanguageTag",name:t},body:Object.entries(e).map(([s,n])=>y(s,n))}),y=(e,t)=>({type:"Message",id:{type:"Identifier",name:e},pattern:{type:"Pattern",elements:[{type:"Text",value:t}]}});async function P({$fs:e,config:t,resources:s}){let n=await u(e);for(let a of s){let r=a.languageTag.name,i=d(a),o=r===t.referenceLanguage?"BaseTranslation":"Translation",c=`import type { ${o} } from './${l(n.outputPath,n.typesFileName)}'

const ${r}: ${o} = ${i}

export default ${r}`;await e.writeFile(l(n.outputPath,`${r}/index.ts`),c)}}var d=e=>{let t=Object.fromEntries(e.body.map(w));return JSON.stringify(t,null,3)};function w(e){return[e.id.name,h(e.pattern)]}function h(e){return e.elements.map(R).join("")}function R(e){switch(e.type){case"Text":return e.value;case"Placeholder":return v(e.placeholder)}}function v(e){switch(e.type){case"Expression":return`{${e.expression.name}}`}}export{b as readResources,P as writeResources};
