import { EXAM } from '../src/data/exam.ts'
const E = EXAM; let errors = 0
const fail = (m:string)=>{errors++;console.log('  ✗',m)}
const ids = new Set<string>(); const secIds = new Set(E.sections.map(s=>s.id))
for (const q of E.questions) {
  if (ids.has(q.id)) fail(`id dupliqué: ${q.id}`); ids.add(q.id)
  if (!secIds.has(q.sectionId)) fail(`${q.id}: section inconnue ${q.sectionId}`)
  if (!(q.points>0)) fail(`${q.id}: points invalides`)
  const optIds = (q.options||[]).map(o=>o.id)
  switch(q.type){
    case 'mcq':
      if((q.options||[]).length<2) fail(`${q.id}: <2 options`)
      if(!optIds.includes(q.correctOption as string)) fail(`${q.id}: correctOption absente`)
      if(new Set(optIds).size!==optIds.length) fail(`${q.id}: ids d'options dupliqués`)
      break
    case 'multi':
      if(!(q.correctOptions||[]).length) fail(`${q.id}: aucune bonne option`)
      for(const c of q.correctOptions||[]) if(!optIds.includes(c)) fail(`${q.id}: correctOption ${c} absente`)
      break
    case 'truefalse':
      if(typeof q.correctBool!=='boolean') fail(`${q.id}: correctBool manquant`)
      break
    case 'short':
      if(!(q.accept||[]).length) fail(`${q.id}: accept vide`)
      if(!q.sample) fail(`${q.id}: sample manquant`)
      break
    case 'long':
      if(!(q.rubric||[]).length) fail(`${q.id}: rubric vide`)
      if(!q.sample) fail(`${q.id}: sample manquant`)
      break
    case 'order': {
      const its=(q.items||[]).map(i=>i.id)
      if(its.length<2) fail(`${q.id}: <2 items`)
      const co=q.correctOrder||[]
      if(co.length!==its.length||[...co].sort().join()!==[...its].sort().join()) fail(`${q.id}: correctOrder != permutation des items`)
      break }
    case 'match': {
      const L=(q.lefts||[]).map(x=>x.id), R=(q.rights||[]).map(x=>x.id), cm=q.correctMatch||{}
      for(const k of Object.keys(cm)){ if(!L.includes(k)) fail(`${q.id}: match clé ${k} absente`); if(!R.includes(cm[k])) fail(`${q.id}: match valeur ${cm[k]} absente`) }
      if(Object.keys(cm).length!==L.length) fail(`${q.id}: match incomplet`)
      break }
    case 'hotspot': {
      if(!q.mockup) fail(`${q.id}: mockup manquant`)
      const sp=(q.spots||[]).map(s=>s.id)
      if(!sp.length) fail(`${q.id}: aucun spot`)
      if(!sp.includes(q.correctSpot as string)) fail(`${q.id}: correctSpot absent`)
      break }
    default: fail(`${q.id}: type inconnu ${q.type}`)
  }
}
for(const s of E.sections) if(!E.questions.some(q=>q.sectionId===s.id)) fail(`section ${s.id} sans question`)
console.log(errors===0?`✅ INTÉGRITÉ OK — ${E.questions.length} questions, ${E.sections.length} sections, ${E.questions.reduce((a,q)=>a+q.points,0)} pts`:`❌ ${errors} erreur(s) d'intégrité`)
process.exit(errors?1:0)
