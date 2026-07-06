'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface City { lat: number; lon: number; label: string }

const GLOBE_H = 210

function toVec3(lat: number, lon: number, r = 1): THREE.Vector3 {
  const phi   = (90 - lat) * Math.PI / 180
  const theta = (lon + 180) * Math.PI / 180
  return new THREE.Vector3(
    -Math.sin(phi) * Math.cos(theta),
     Math.cos(phi),
     Math.sin(phi) * Math.sin(theta)
  ).multiplyScalar(r)
}

function arcCurve(c1: City, c2: City, n = 80): THREE.Vector3[] {
  const a = toVec3(c1.lat, c1.lon)
  const b = toVec3(c2.lat, c2.lon)
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const v = new THREE.Vector3().lerpVectors(a, b, t).normalize()
    pts.push(v.multiplyScalar(1.03 + 0.08 * Math.sin(t * Math.PI)))
  }
  return pts
}

export default function GlobeViz({ city1, city2 }: { city1: City; city2: City }) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const W = el.clientWidth || 300
    const H = GLOBE_H

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    el.appendChild(renderer.domElement)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100)
    camera.position.z = 3.5

    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const sun = new THREE.DirectionalLight(0xffe8c0, 1.4)
    sun.position.set(5, 3, 4)
    scene.add(sun)
    const fill = new THREE.DirectionalLight(0x4466cc, 0.25)
    fill.position.set(-4, -2, -3)
    scene.add(fill)

    const group = new THREE.Group()
    scene.add(group)

    // Globe
    const mat = new THREE.MeshPhongMaterial({ specular: 0x222222, shininess: 18 })
    group.add(new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), mat))
    new THREE.TextureLoader().load(
      'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
      tex => { mat.map = tex; mat.needsUpdate = true },
      undefined,
      () => { mat.color.set(0x1a6090) },
    )

    // Atmosphère
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.04, 48, 48),
      new THREE.MeshPhongMaterial({ color: 0x4488ff, transparent: true, opacity: 0.07, side: THREE.FrontSide })
    ))

    // Marqueurs
    function addMarker(lat: number, lon: number, color: number) {
      const pos = toVec3(lat, lon, 1.03)
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 16), new THREE.MeshBasicMaterial({ color }))
      dot.position.copy(pos)
      group.add(dot)
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.038, 0.056, 32),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
      )
      halo.position.copy(pos)
      halo.lookAt(0, 0, 0)
      group.add(halo)
    }
    addMarker(city1.lat, city1.lon, 0xffffff) // départ blanc
    addMarker(city2.lat, city2.lon, 0x36a6b2) // arrivée bleu

    // Arc — tube 3D avec MeshPhongMaterial pour l'effet de relief
    const pts = arcCurve(city1, city2)
    const curve = new THREE.CatmullRomCurve3(pts)
    const tube  = new THREE.TubeGeometry(curve, 80, 0.011, 10, false)
    group.add(new THREE.Mesh(tube, new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(0x99ccff),
      emissiveIntensity: 0.4,
      shininess: 90,
      transparent: true,
      opacity: 0.95,
    })))

    // Orientation initiale : ville de départ face à la caméra
    group.rotation.y = (-city1.lon - 90) * Math.PI / 180

    // — Drag pour tourner le globe —
    let dragging = false
    let prevX = 0, prevY = 0
    let autoRotate = true

    const onDown = (x: number, y: number) => { dragging = true; autoRotate = false; prevX = x; prevY = y }
    const onMove = (x: number, y: number) => {
      if (!dragging) return
      group.rotation.y += (x - prevX) * 0.007
      group.rotation.x += (y - prevY) * 0.007
      // limite l'inclinaison pour ne pas retourner le globe
      group.rotation.x = Math.max(-1.2, Math.min(1.2, group.rotation.x))
      prevX = x; prevY = y
    }
    const onUp = () => { dragging = false; autoRotate = true }

    const onMouseDown = (e: MouseEvent) => onDown(e.clientX, e.clientY)
    const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY)
    const onTouchStart = (e: TouchEvent) => { onDown(e.touches[0].clientX, e.touches[0].clientY) }
    const onTouchMove  = (e: TouchEvent) => { e.preventDefault(); onMove(e.touches[0].clientX, e.touches[0].clientY) }

    renderer.domElement.addEventListener('mousedown',  onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup',   onUp)
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false })
    renderer.domElement.addEventListener('touchmove',  onTouchMove,  { passive: false })
    renderer.domElement.addEventListener('touchend',   onUp)

    // Animation
    let rafId: number
    const animate = () => {
      rafId = requestAnimationFrame(animate)
      if (autoRotate) group.rotation.y -= 0.0018 // sens de rotation de la Terre (est vers ouest visuellement)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(rafId)
      renderer.domElement.removeEventListener('mousedown',  onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup',   onUp)
      renderer.domElement.removeEventListener('touchstart', onTouchStart)
      renderer.domElement.removeEventListener('touchmove',  onTouchMove)
      renderer.domElement.removeEventListener('touchend',   onUp)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [city1.lat, city1.lon, city2.lat, city2.lon])

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: GLOBE_H, borderRadius: 20, overflow: 'hidden', background: 'white' }}
    />
  )
}
