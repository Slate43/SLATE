'use client'
import { useState } from 'react'
import styles from './page.module.css'

const TEAMS = {
  BOS:{abbrev:'BOS',bg:'#007A33',text:'#fff',border:'#00581f'},
  NYK:{abbrev:'NYK',bg:'#006BB6',text:'#F58426',border:'#004f8a'},
  GSW:{abbrev:'GSW',bg:'#1D428A',text:'#FFC72C',border:'#163268'},
  MEM:{abbrev:'MEM',bg:'#5D76A9',text:'#12173F',border:'#4a5e8a'},
  FLA:{abbrev:'FLA',bg:'#C8102E',text:'#fff',border:'#9e0c23'},
  TB:{abbrev:'TB',bg:'#002868',text:'#FCAF17',border:'#001a44'},
  VGK:{abbrev:'VGK',bg:'#B4975A',text:'#333F42',border:'#8c7340'},
  DAL:{abbrev:'DAL',bg:'#006847',text:'#fff',border:'#004d34'},
  LAD:{abbrev:'LAD',bg:'#005A9C',text:'#EF3E42',border:'#003d6b'},
  SD:{abbrev:'SD',bg:'#2F241D',text:'#FFC425',border:'#1a140f'},
  NYY:{abbrev:'NYY',bg:'#003087',text:'#fff',border:'#001e54'},
  BAL:{abbrev:'BAL',bg:'#DF4601',text:'#fff',border:'#b33800'},
  LAL:{abbrev:'LAL',bg:'#552583',text:'#FDB927',border:'#3d1a5e'},
  CHI:{abbrev:'CHI',bg:'#CE1141',text:'#fff',border:'#a00d33'},
  MIA:{abbrev:'MIA',bg:'#98002E',text:'#F9A01B',border:'#70001f'},
  BKN:{abbrev:'BKN',bg:'#000000',text:'#fff',border:'#333'},
  TOR:{abbrev:'TOR',bg:'#CE1141',text:'#fff',border:'#a00d33'},
  DEN:{abbrev:'DEN',bg:'#0E2240',text:'#FEC524',border:'#0a1830'},
  PHX:{abbrev:'PHX',bg:'#1D1160',text:'#E56020',border:'#150c47'},
  MIL:{abbrev:'MIL',bg:'#00471B',text:'#EEE1C6',border:'#003314'},
  NYR:{abbrev:'NYR',bg:'#0038A8',text:'#CE1126',border:'#002a7a'},
  BOS_NHL:{abbrev:'BRS',bg:'#FFB81C',text:'#000',border:'#cc9200'},
  PIT:{abbrev:'PIT',bg:'#FCB514',text:'#000',border:'#c99010'},
  CHI_NHL:{abbrev:'CHW',bg:'#CF0A2C',text:'#fff',border:'#a00822'},
  TOR_NHL:{abbrev:'TML',bg:'#003E7E',text:'#fff',border:'#002d5c'},
  COL:{abbrev:'COL',bg:'#6F263D',text:'#236192',border:'#4f1c2c'},
  EDM:{abbrev:'EDM',bg:'#041E42',text:'#FF4C00',border:'#021428'},
}

const EXAMPLE_PICKS = [
  {sport:'NBA',game:'LA Lakers vs Chicago Bulls',pick:'Lakers -3.5',confidence:79,type:'Spread',odds:'-110',t1:'LAL',t2:'CHI'},
  {sport:'NHL',game:'NY Rangers vs Pittsburgh Penguins',pick:'Rangers ML',confidence:73,type:'Moneyline',odds:'-125',t1:'NYR',t2:'PIT'},
  {sport:'MLB',game:'LA Dodgers vs San Diego Padres',pick:'Dodgers -1.5',confidence:68,type:'Run Line',odds:'+106',t1:'LAD',t2:'SD'},
  {sport:'NBA',game:'Miami Heat vs Toronto Raptors',pick:'Under 216.5',confidence:71,type:'Total',odds:'-108',t1:'MIA',t2:'TOR'},
  {sport:'NHL',game:'Colorado Avalanche vs Edmonton Oilers',pick:'Over 6',confidence:66,type:'Total',odds:'-112',t1:'COL',t2:'EDM'},
  {sport:'MLB',game:'New York Yankees vs Baltimore Orioles',pick:'Yankees ML',confidence:74,type:'Moneyline',odds:'-142',t1:'NYY',t2:'BAL'},
]

function TeamBadge({ teamKey, size }) {
  const t = TEAMS[teamKey] || { abbrev: teamKey, bg: '#1a1a1a', text: '#888', border: '#333' }
  const fontSize = size >= 56 ? 13 : size >= 30 ? 9 : 8
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: t.bg, border: `2px solid ${t.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-syne), Syne, sans-serif',
      fontSize, fontWeight: 800, color: t.text,
      flexShrink: 0, letterSpacing: '-0.3px'
    }}>
      {t.abbrev}
    </div>
  )
}

function PillLogo({ size = 'md' }) {
  const sizes = {
    sm: { pill: '8px 16px 8px 12px', gap: 7, sq: 7, sqGap: 2, sqRadius: 2, font: 16 },
    md: { pill: '10px 22px 10px 16px', gap: 9, sq: 9, sqGap: 2.5, sqRadius: 2.5, font: 20 },
    lg: { pill: '13px 28px 13px 20px', gap: 12, sq: 12, sqGap: 3.5, sqRadius: 3, font: 26 },
  }
  const s = sizes[size]
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: s.gap,
      background: 'linear-gradient(135deg, #6D28D9, #9333EA)',
      borderRadius: 100, padding: s.pill,
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: s.sqGap }}>
        {[1, 0.4, 0.4, 1].map((op, i) => (
          <div key={i} style={{ width: s.sq, height: s.sq, borderRadius: s.sqRadius, background: 'white', opacity: op }} />
        ))}
      </div>
      <span style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: s.font, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>
        Slate
      </span>
    </div>
  )
}

function PickCard({ pick, index }) {
  const [open, setOpen] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAnalysis = async () => {
    if (open && analysis) { setOpen(false); return }
    setOpen(true)
    if (analysis) return
    setLoading(true)
    try {
      const res = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pick })
      })
      const data = await res.json()
      setAnalysis(data)
    } catch (e) {
      setAnalysis({ confidence: 65, summary: 'Analysis unavailable.', reasons: ['Could not retrieve data.'] })
    }
    setLoading(false)
  }

  const sportPillColors = {
    NBA: { bg: 'rgba(59,130,246,0.12)', color: '#60A5FA', border: 'rgba(59,130,246,0.2)' },
