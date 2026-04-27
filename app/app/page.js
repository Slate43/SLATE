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
    MLB: { bg: 'rgba(34,197,94,0.12)', color: '#4ADE80', border: 'rgba(34,197,94,0.2)' },
    NHL: { bg: 'rgba(168,85,247,0.12)', color: '#C084FC', border: 'rgba(168,85,247,0.2)' },
    NFL: { bg: 'rgba(239,68,68,0.12)', color: '#F87171', border: 'rgba(239,68,68,0.2)' },
  }
  const sp = sportPillColors[pick.sport] || { bg: 'rgba(255,255,255,0.06)', color: '#888', border: '#222' }
  const conf = analysis?.confidence || 0
  const edgeColor = conf >= 70 ? '#22C55E' : conf >= 55 ? '#FBBF24' : '#F87171'
  const edgeLabel = conf >= 70 ? 'High Edge' : conf >= 55 ? 'Mod Edge' : 'Low Edge'

  if (index === 0) {
    const t1 = TEAMS[pick.t1] || {}
    return (
      <div className={styles.featCard} style={{ background: `linear-gradient(135deg, ${t1.bg ? t1.bg + '22' : '#13003A'}, #0a0018)` }}>
        <div className={styles.featGlow} />
        <div className={styles.featBadge}>
          <div className={styles.featDot} />
          <span className={styles.featBadgeTxt}>Top Pick Today</span>
        </div>
        <div className={styles.teamsRow}>
          <div className={styles.teamBlock}><TeamBadge teamKey={pick.t1} size={60} /><span className={styles.teamAbbrev}>{pick.t1}</span></div>
          <div className={styles.vsDiv}><div className={styles.vsLine} /><span className={styles.vsTxt}>VS</span><div className={styles.vsLine} /></div>
          <div className={styles.teamBlock}><TeamBadge teamKey={pick.t2} size={60} /><span className={styles.teamAbbrev}>{pick.t2}</span></div>
        </div>
        <div className={styles.featType}>{pick.sport} · {pick.type}</div>
        <div className={styles.featPickRow}>
          <span className={styles.featPick}>{pick.pick}</span>
          <span className={styles.featOdds}>{pick.odds}</span>
        </div>
        <div className={styles.confRow}>
          <div className={styles.confBg}><div className={styles.confFill} style={{ width: `${pick.confidence}%` }} /></div>
          <span className={styles.confPct}>{pick.confidence}%</span>
        </div>
        <button className={styles.anaBtn} onClick={handleAnalysis}>
          {open && loading ? '⏳ Analyzing...' : '✦ Click for Analysis'}
        </button>
        {open && analysis && (
          <div className={styles.featAnalysis}>
            <div className={styles.apConfRow}>
              <span className={styles.apPct}>{analysis.confidence}%</span>
              <span className={styles.edgeChip} style={{ color: edgeColor, borderColor: edgeColor + '44', background: edgeColor + '18' }}>{edgeLabel}</span>
            </div>
            {analysis.summary && <p className={styles.apSum}>{analysis.summary}</p>}
            <div className={styles.apReasons}>
              {analysis.reasons?.slice(0, 3).map((r, i) => (
                <div key={i} className={styles.rRow}><span className={styles.rNum}>0{i + 1}</span><span className={styles.rTxt}>{r}</span></div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.pickCard} style={{ animationDelay: `${index * 0.05}s` }}>
      <div className={styles.pickMain}>
        <div className={styles.teamsSm}>
          <TeamBadge teamKey={pick.t1} size={30} />
          <div style={{ marginLeft: -10, outline: '2px solid #000', borderRadius: '50%' }}>
            <TeamBadge teamKey={pick.t2} size={30} />
          </div>
        </div>
        <span className={styles.sportPill} style={{ background: sp.bg, color: sp.color, border: `1px solid ${sp.border}` }}>{pick.sport}</span>
        <div className={styles.pickInfo}>
          <div className={styles.pickGame}>{pick.game}</div>
          <div className={styles.pickRec}>Pick: <span style={{ color: '#A855F7' }}>{pick.pick}</span></div>
        </div>
        <div className={styles.pickRight}>
          <span className={styles.pickOdds}>{pick.odds}</span>
          <button className={styles.pickABtn} onClick={handleAnalysis}>
            {open && loading ? '...' : '+ Analysis'}
          </button>
        </div>
      </div>
      {open && analysis && (
        <div className={styles.ap}>
          <div className={styles.apConfRow}>
            <span className={styles.apPct}>{analysis.confidence}%</span>
            <span className={styles.edgeChip} style={{ color: edgeColor, borderColor: edgeColor + '44', background: edgeColor + '18' }}>{edgeLabel}</span>
          </div>
          {analysis.summary && <p className={styles.apSum}>{analysis.summary}</p>}
          <div className={styles.apReasons}>
            {analysis.reasons?.slice(0, 3).map((r, i) => (
              <div key={i} className={styles.rRow}><span className={styles.rNum}>0{i + 1}</span><span className={styles.rTxt}>{r}</span></div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const [screen, setScreen] = useState('home')
  const [picks, setPicks] = useState(EXAMPLE_PICKS)
  const [generating, setGenerating] = useState(false)

  const generatePicks = async () => {
    if (generating) return
    setGenerating(true)
    try {
      const res = await fetch('/api/picks')
      const data = await res.json()
      if (data.picks?.length) setPicks(data.picks)
    } catch (e) { }
    setGenerating(false)
  }

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className={styles.app}>
      <div className={styles.phone}>
        <div className={styles.notch} />
        <div className={styles.statusBar}>
          <span className={styles.statusTime}>9:41</span>
          <div className={styles.statusIcons}>
            <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><rect x="0" y="3" width="3" height="8" rx="1" fill="#fff" /><rect x="4.5" y="2" width="3" height="9" rx="1" fill="#fff" /><rect x="9" y="0" width="3" height="11" rx="1" fill="#fff" /><rect x="13.5" y="0" width="2.5" height="11" rx="1" fill="#fff" opacity="0.3" /></svg>
            <svg width="25" height="11" viewBox="0 0 25 11" fill="none"><rect x="0.5" y="0.5" width="21" height="10" rx="3.5" stroke="#fff" strokeOpacity="0.35" /><rect x="2" y="2" width="16" height="7" rx="2" fill="#fff" /></svg>
          </div>
        </div>

        {screen === 'home' && (
          <div className={styles.screen}>
            <div className={styles.header}>
              <PillLogo size="md" />
              <div className={styles.notifBtn}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6V9.5L2 11H14L12.5 9.5V6C12.5 3.5 10.5 1.5 8 1.5Z" stroke="#555" strokeWidth="1.2" /><path d="M6.5 11C6.5 11.8 7.2 12.5 8 12.5C8.8 12.5 9.5 11.8 9.5 11" stroke="#555" strokeWidth="1.2" /></svg>
              </div>
            </div>
            <div className={styles.statsRow}>
              <div className={styles.statBlock}><div className={styles.statLbl}>All-Time</div><div className={styles.statVal} style={{ color: '#A855F7' }}>186-112</div><div className={styles.statSub}>all sports</div></div>
              <div className={styles.statBlock}><div className={styles.statLbl}>Yesterday</div><div className={styles.statVal} style={{ color: '#22C55E' }}>4-2</div><div className={styles.statSub}>6 picks</div></div>
              <div className={styles.statBlock}><div className={styles.statLbl}>Win %</div><div className={styles.statVal}>62.4%</div><div className={styles.statSub}>ATS all time</div></div>
            </div>
            <div className={styles.genSection}>
              <button className={styles.genBtn} onClick={generatePicks} disabled={generating}>
                {generating ? 'Analyzing...' : '✦ Generate New Picks'}
              </button>
            </div>
            <div className={styles.secHdr}>
              <span className={styles.secTitle}>Today's Picks</span>
              <span className={styles.secSub}>{today}</span>
            </div>
            <div className={styles.picksList}>
              {picks.map((pick, i) => <PickCard key={i} pick={pick} index={i} />)}
            </div>
            <div style={{ height: 20 }} />
          </div>
        )}

        {screen === 'record' && (
          <div className={styles.screen}>
            <div className={styles.header}><span className={styles.screenTitle}>Record</span></div>
            <div className={styles.recHero}>
              <div className={styles.recHeroLbl}>All-Time Performance</div>
              <div className={styles.recBig}><span className={styles.recWL}>186-112</span><span className={styles.recPush}>-8</span></div>
              <div className={styles.recRoi}>+8.4% ROI · W3 streak</div>
            </div>
            <div className={styles.recGrid}>
              {[
                { sport: 'NBA', rec: '58-34', pct: '63.0', color: '#60A5FA', grad: '#1d4ed8,#60A5FA' },
                { sport: 'MLB', rec: '72-41', pct: '63.7', color: '#4ADE80', grad: '#166534,#4ADE80' },
                { sport: 'NHL', rec: '34-22', pct: '60.7', color: '#C084FC', grad: '#6d28d9,#C084FC' },
                { sport: 'NFL', rec: '22-15', pct: '59.5', color: '#F87171', grad: '#991b1b,#F87171' },
              ].map(s => (
                <div key={s.sport} className={styles.recCard}>
                  <div className={styles.rcSport} style={{ color: s.color }}>{s.sport}</div>
                  <div className={styles.rcRec}>{s.rec}</div>
                  <div className={styles.rcPct}>{s.pct}% ATS</div>
                  <div className={styles.rcBar}><div className={styles.rcFill} style={{ width: `${s.pct}%`, background: `linear-gradient(90deg,${s.grad})` }} /></div>
                </div>
              ))}
            </div>
            <div className={styles.histTitle}>Recent Picks</div>
            <div className={styles.histList}>
              {[
                { r: 'W', sport: 'NBA', game: 'Celtics vs Knicks', pick: 'Celtics -4.5', date: 'Apr 26' },
                { r: 'W', sport: 'MLB', game: 'Dodgers vs Padres', pick: 'Dodgers -1.5', date: 'Apr 26' },
                { r: 'L', sport: 'NHL', game: 'Panthers vs Lightning', pick: 'Panthers ML', date: 'Apr 26' },
                { r: 'W', sport: 'NBA', game: 'Warriors vs Grizzlies', pick: 'Over 224.5', date: 'Apr 26' },
                { r: 'W', sport: 'MLB', game: 'Yankees vs Orioles', pick: 'Yankees ML', date: 'Apr 26' },
                { r: 'L', sport: 'NHL', game: 'Knights vs Stars', pick: 'Under 5.5', date: 'Apr 26' },
                { r: 'W', sport: 'NBA', game: 'Bucks vs 76ers', pick: 'Bucks -3', date: 'Apr 25' },
                { r: 'P', sport: 'MLB', game: 'Cubs vs Cardinals', pick: 'Over 8', date: 'Apr 25' },
              ].map((h, i) => {
                const rc = h.r === 'W' ? { bg: 'rgba(34,197,94,0.15)', color: '#22C55E', border: 'rgba(34,197,94,0.2)' } : h.r === 'L' ? { bg: 'rgba(239,68,68,0.12)', color: '#F87171', border: 'rgba(239,68,68,0.2)' } : { bg: 'rgba(255,255,255,0.06)', color: '#888', border: '#222' }
                const sp = { NBA: '#60A5FA', MLB: '#4ADE80', NHL: '#C084FC', NFL: '#F87171' }
                return (
                  <div key={i} className={styles.histItem}>
                    <div className={styles.histRes} style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>{h.r}</div>
                    <div className={styles.histInfo}><div className={styles.histGame}>{h.game}</div><div className={styles.histPick}>{h.pick}</div></div>
                    <div className={styles.histMeta}>
                      <span className={styles.sportPill} style={{ background: sp[h.sport] + '18', color: sp[h.sport], border: `1px solid ${sp[h.sport]}33` }}>{h.sport}</span>
                      <span className={styles.histDate}>{h.date}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ height: 20 }} />
          </div>
        )}

        {screen === 'profile' && (
          <div className={styles.screen}>
            <div className={styles.header}><span className={styles.screenTitle}>Profile</span></div>
            <div className={styles.profHero}>
              <div className={styles.profGlow} />
              <div className={styles.profAvatar}>C</div>
              <div className={styles.profName}>Christopher</div>
              <span className={styles.profPlan}>Free Plan</span>
            </div>
            <div className={styles.upgradeCard}>
              <div className={styles.upgradeTitle}>Upgrade to Pro</div>
              <div className={styles.upgradeSub}>Unlock every pick, full AI analysis, and confidence scores — every day.</div>
              <div className={styles.upgradeFeatures}>
                {['All 6 daily picks unlocked', 'AI analysis on every pick', 'Confidence scores & edge ratings', 'Early access to new sports', 'Priority pick notifications'].map(f => (
                  <div key={f} className={styles.ufItem}>
                    <div className={styles.ufCheck}>✓</div>
                    <span className={styles.ufText}>{f}</span>
                  </div>
                ))}
              </div>
              <button className={styles.upgradeBtn}>Upgrade to Pro <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.8 }}>$19/month</span></button>
            </div>
            <div className={styles.settingsSection}>
              <div className={styles.settingsTitle}>Settings</div>
              {[{ icon: '🔔', label: 'Notifications' }, { icon: '🏆', label: 'Favorite Sports' }, { icon: '📊', label: 'Bet Tracker' }, { icon: '🔒', label: 'Privacy & Security' }, { icon: '❓', label: 'Help & Support' }].map(s => (
                <div key={s.label} className={styles.settingItem}>
                  <div className={styles.settingLeft}>
                    <div className={styles.settingIcon}>{s.icon}</div>
                    <span className={styles.settingLabel}>{s.label}</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12l4-4-4-4" stroke="#444" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              ))}
            </div>
            <div style={{ height: 20 }} />
          </div>
        )}

        <div className={styles.bottomNav}>
          {[
            { id: 'home', label: 'Home', icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 9.5L11 3L19 9.5V19H14V14H8V19H3V9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg> },
            { id: 'record', label: 'Record', icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 16L8 10L12 13L16 7L20 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg> },
            { id: 'profile', label: 'Profile', icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" /><path d="M3 19C3 15.7 6.6 13 11 13C15.4 13 19 15.7 19 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg> },
          ].map(n => (
            <button key={n.id} className={`${styles.navItem} ${screen === n.id ? styles.navActive : ''}`} onClick={() => setScreen(n.id)}>
              <span style={{ color: screen === n.id ? '#A855F7' : '#333' }}>{n.icon}</span>
              <span className={styles.navLabel} style={{ color: screen === n.id ? '#A855F7' : '#444' }}>{n.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
