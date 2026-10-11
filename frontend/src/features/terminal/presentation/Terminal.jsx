import { useEffect, useRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'
import {
  registerTerminalWriter,
  resizeTerminal,
  sendTerminalInput,
} from '../application/terminalActions'

export default function Terminal() {
  const containerRef = useRef(null)
  const termRef = useRef(null)

  useEffect(() => {
    const term = new XTerm({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "ui-monospace, 'Cascadia Code', Consolas, monospace",
      theme: {
        background: '#121216',
        foreground: '#e8eaed',
        cursor: '#8ab4f8',
        selectionBackground: '#3c4a6a',
        black: '#202124',
        blue: '#8ab4f8',
        green: '#81c995',
        yellow: '#fdd663',
        red: '#f28b82',
      },
    })
    const fit = new FitAddon()
    term.loadAddon(fit)
    term.loadAddon(new WebLinksAddon())
    term.open(containerRef.current)
    fit.fit()
    termRef.current = term

    registerTerminalWriter((data) => term.write(data))
    term.onData((data) => sendTerminalInput(data))

    const observer = new ResizeObserver(() => {
      fit.fit()
      resizeTerminal(term.cols, term.rows)
    })
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      registerTerminalWriter(null)
      term.dispose()
    }
  }, [])

  return <div ref={containerRef} className="xterm-wrap" />
}
