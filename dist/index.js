var p=async(e,t,a=0)=>{let n=await e.readdir(t,{withFileTypes:!0}),i=n.filter(r=>!r.isDirectory()).map(({name:r})=>({name:r.toString(),folder:""})),s=n.filter(r=>r.isDirectory());if(a)for(let r of s)i.push(...(await p(e,`${t}/${r.name}/`,a-1)).map(o=>({name:o.name.toString(),folder:r.name.toString()})));return i},g=async(e,t,a)=>{let n=a==="JavaScript"?".js":".ts";return(await p(e,t,1)).filter(({folder:s,name:r})=>s&&r===`index${n}`).map(({folder:s})=>s)},m=async e=>({baseLocale:"en",tempPath:"./node_modules/typesafe-i18n/temp-output/",outputPath:"./src/i18n/",outputFormat:"TypeScript",typesFileName:"i18n-types",utilFileName:"i18n-util",formattersTemplateFileName:"formatters",typesTemplateFileName:"custom-types",esmImports:!1,adapter:void 0,generateOnlyTypes:!1,banner:"/* eslint-disable */",runAfterGenerator:void 0,...e}),f=async e=>{let t=await e.readFile(".typesafe-i18n.json").catch(()=>"{}");return JSON.parse(t.toString())},c=async e=>{let t=await f(e);return m(t)},y=async e=>{let t=await c(e);return{base:t.baseLocale,locales:await g(e,t.outputPath,t.outputFormat)}};var l=(...e)=>e.map(t=>{for(;t.startsWith("/");)t=t.substring(1);for(;t.endsWith("/");)t=t.substring(0,t.length-1);return t}).join("/");async function C({config:e,$fs:t}){let a=await c(t),n=[];for(let i of e.languages){let s=await d(t,a.outputPath,i);n.push(w(s,i))}return n}var d=async(e,t,a)=>{let r=(await e.readFile(l(t,`${a}/index.ts`),"utf-8")).toString().split(`
`).filter(u=>!u.trim().startsWith("import ")).join(`
`).replace(/:.*=/g," =").replace(/ satisfies.*\/n/g,`
`);return(await import("data:application/javascript,"+encodeURIComponent(r))).default},w=(e,t)=>({type:"Resource",languageTag:{type:"LanguageTag",name:t},body:Object.entries(e).map(([a,n])=>h(a,n))}),h=(e,t)=>({type:"Message",id:{type:"Identifier",name:e},pattern:{type:"Pattern",elements:[{type:"Text",value:t}]}});async function $({$fs:e,config:t,resources:a}){let n=await c(e);for(let i of a){let s=i.languageTag.name,r=R(i),o=s===t.referenceLanguage?"BaseTranslation":"Translation",u=`import type { ${o} } from '${l(n.outputPath,n.typesFileName)}'

const ${s}: ${o} = ${r}

export default ${s}`;await e.writeFile(l(n.outputPath,`${s}/index.ts`),u)}}var R=e=>{let t=Object.fromEntries(e.body.map(v));return JSON.stringify(t,null,3)};function v(e){return[e.id.name,F(e.pattern)]}function F(e){return e.elements.map(T).join("")}function T(e){switch(e.type){case"Text":return e.value;case"Placeholder":return b(e.placeholder)}}function b(e){switch(e.type){case"Expression":return`{${e.expression.name}}`}}export{y as getLocaleInformation,C as readResources,$ as writeResources};
