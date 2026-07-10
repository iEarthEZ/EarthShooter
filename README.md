# EARTH SHOOTER

Welcome to **EARTH SHOOTER**. I basically wanted to make an intense, chaotic, top-down arena shooter that just *runs*—no plugins, no loading screens, no BS. It’s built entirely with plain old Vanilla JS and HTML5 Canvas. 

Survive the endless swarms, grab XP, break the game with crazy upgrade combos, and try not to get obliterated by a literal black hole. 

## Why this is (hopefully) fun

* **Snappy AF Controls:** I hate input lag in browser games, so I wrote a custom movement model. It feels tight, responsive, and does exactly what you want it to.
* **No Assets? No Problem:** All the sound effects (pew pews, explosions, level-ups) are synthesized in real-time using the Web Audio API. Zero external audio files to download.
* **Trippy Space Backgrounds:** The background isn't just a static image. It's a living grid that physically bends around gravity wells and black holes.
* **Maximum Juice:** Screen shake, floating damage numbers, massive shockwaves, and absurd amounts of particles. 

## How to Play

* **Move:** `W`, `A`, `S`, `D` 
* **Aim & Shoot:** Mouse to aim, `Left Click` (hold) to fire.
* **The Goal:** Don't die. Collect the little XP gems, stack your upgrades, and see how long you can last before the bosses humble you.

## The SPACE

The game director throws different stuff at you the longer you survive. 

* **Basic (Red):** Standard cannon fodder.
* **Shooter (Cyan):** Annoying cowards that keep their distance and shoot back.
* **Heavy (Purple):** Slow, tanky, hits like a truck.
* **Sprinter (Yellow):** Fast as hell glass cannons. Kill these first.
* **Juggernaut (Brown):** Absolute units. Basically walking bullet sponges.
* **Swarmer (Light Green):** Weak, but they move in weird wavy patterns just to make you miss.
* **Sniper (Deep Orange):** Will snipe you from off-screen if you aren't paying attention.

## Boss Events

If you survive long enough, normal enemies despawn and things get weird:
* **Level 7 - TON-618 Singularity:** A massive black hole that bends the screen, sucks you in, and spits out bullet hell waves.
* **Level 15 - SOLAR FLARE CORE:** A giant angry star shooting god-rays. You have to hit its exposed core while trying not to melt.

## Upgrades (Break the Game)

Every time you level up, you get a choice. Stack them to make ridiculous builds:

* **Rapid Fire:** Shoot faster.
* **Spread Shot:** More bullets per click (highly recommended).
* **Heavy Rounds:** Bigger bullets, more pain.
* **Agility:** Gotta go fast.
* **Vitality:** Max HP up + full heal. A lifesaver.
* **Titanium Armor:** Flat damage reduction.
* **Nano-Regen:** Passive healing because we all make mistakes.
* **High-Velocity Rounds:** Bullets travel across the screen instantly.
* **Critical Targeting:** RNG double damage (look for the red bullets).
* **Vampirism:** Heal when you kill stuff. 
* **Colossal Warheads:** Makes your bullets comically large and devastating.

## How to Run It

Honestly, the best part. No `npm install`, no webpack, no local server required.

Just click [play](https://iearthez.github.io/EarthShooter/) And start playing!