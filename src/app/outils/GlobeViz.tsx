'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface City { lat: number; lon: number; label: string }

const GLOBE_H = 210  // hauteur fixe — doit correspondre au style du div

function toVec3(lat: number, lon: number, r = 1): THREE.Vector3 {
  const phi   = (90 - lat) * Math.PI / 180
  const theta = (lon + 180) * Math.PI / 180
  return new THREE.Vector3(
    -Math.sin(phi) * Math.cos(theta),
     Math.cos(phi),
     Math.sin(phi) * Math.sin(theta)
  ).multiplyScalar(r)
}

function arcPoints(c1: City, c2: City, n = 80): THREE.Vector3[] {
  const a = toVec3(c1.lat, c1.lon)
  const b = toVec3(c2.lat, c2.lon)
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const v = new THREE.Vector3().lerpVectors(a, b, t).normalize()
    // arc légèrement surélevé (max +0.08 au milieu)
    const bulge = 1.03 + 0.08 * Math.sin(t * Math.PI)
    pts.push(v.multiplyScalar(bulge))
  }
  return pts
}

export default function GlobeViz({ city1, city2 }: { city1: City; city2: City }) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    // Hauteur fixe pour éviter le bug clientHeight=0 au mount
    const W = el.clientWidth || 300
    const H = GLOBE_H

    // — Renderer —
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    el.appendChild(renderer.domElement)

    // — Scene & Camera —
    // FOV vertical 38° : à z=3.5 la demi-hauteur visible = 3.5*tan(19°) ≈ 1.21
    // Le globe (rayon 1) + arc (max 1.11) tient dans 1.21 avec marge
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100)
    camera.position.z = 3.5

    // — Lights —
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const sun = new THREE.DirectionalLight(0xffe8c0, 1.4)
    sun.position.set(5, 3, 4)
    scene.add(sun)
    const fill = new THREE.DirectionalLight(0x4466cc, 0.25)
    fill.position.set(-4, -2, -3)
    scene.add(fill)

    // — Group (tout tourne ensemble) —
    const group = new THREE.Group()
    scene.add(group)

    // — Globe —
    const geo = new THREE.SphereGeometry(1, 64, 64)
    const mat = new THREE.MeshPhongMaterial({ specular: 0x222222, shininess: 18 })
    group.add(new THREE.Mesh(geo, mat))

    new THREE.TextureLoader().load(
      'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
      tex => { mat.map = tex; mat.needsUpdate = true },
      undefined,
      () => { mat.color.set(0x1a6090) },
    )

    // — Atmosphère —
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.04, 48, 48),
      new THREE.MeshPhongMaterial({ color: 0x4488ff, transparent: true, opacity: 0.07, side: THREE.FrontSide })
    ))

    // — Marqueurs —
    function addMarker(lat: number, lon: number, color: number) {
      const pos = toVec3(lat, lon, 1.03)
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.028, 16, 16),
        new THREE.MeshBasicMaterial({ color })
      )
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

    addMarker(city1.lat, city1.lon, 0xffd700)
    addMarker(city2.lat, city2.lon, 0x36a6b2)

    // — Arc —
    const pts = arcPoints(city1, city2)
    group.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })
    ))

    // — Orientation initiale —
    const avgLon = (city1.lon + city2.lon) / 2
    group.rotation.y = (-avgLon - 90) * Math.PI / 180

    // — Animation —
    let rafId: number
    const animate = () => {
      rafId = requestAnimationFrame(animate)
      group.rotation.y += 0.0018
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(rafId)
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
