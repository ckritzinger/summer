<script setup>
import { ref, computed } from 'vue'
import {
  getUsers,
  createUser,
  updateUserScore,
  getSettings,
  saveSettings,
  getActiveUserId,
  setActiveUserId,
} from './lib/storage.js'
import ProfileSelect from './components/ProfileSelect.vue'
import Home from './components/Home.vue'
import PinGate from './components/PinGate.vue'
import Settings from './components/Settings.vue'
import Game from './components/Game.vue'
import Summary from './components/Summary.vue'
import Leaderboard from './components/Leaderboard.vue'

const users = ref(getUsers())
const settings = ref(getSettings())
const activeUserId = ref(getActiveUserId())

const activeUser = computed(() => users.value.find((u) => u.id === activeUserId.value) || null)

const screen = ref(activeUser.value ? 'home' : 'profiles')
const lastScore = ref(0)
const previousBestSnapshot = ref(0)

function selectUser(id) {
  activeUserId.value = id
  setActiveUserId(id)
  screen.value = 'home'
}

function createAndSelectUser({ name, avatar }) {
  const user = createUser(name, avatar)
  users.value = getUsers()
  selectUser(user.id)
}

function updateSettings(next) {
  settings.value = next
  saveSettings(next)
}

function startGame() {
  previousBestSnapshot.value = activeUser.value?.bestScore ?? 0
  screen.value = 'game'
}

function finishGame(score) {
  lastScore.value = score
  if (activeUser.value) {
    updateUserScore(activeUser.value.id, score)
    users.value = getUsers()
  }
  screen.value = 'summary'
}

function goHome() {
  screen.value = 'home'
}

function switchUser() {
  activeUserId.value = null
  setActiveUserId(null)
  screen.value = 'profiles'
}
</script>

<template>
  <ProfileSelect v-if="screen === 'profiles'" :users="users" @select="selectUser" @create="createAndSelectUser" />

  <Home
    v-else-if="screen === 'home' && activeUser"
    :user="activeUser"
    @start="startGame"
    @leaderboard="screen = 'leaderboard'"
    @switch-user="switchUser"
    @settings="screen = 'pin'"
  />

  <PinGate v-else-if="screen === 'pin'" @back="goHome" @unlocked="screen = 'settings'" />

  <Settings
    v-else-if="screen === 'settings'"
    :settings="settings"
    @back="goHome"
    @update-settings="updateSettings"
  />

  <Game
    v-else-if="screen === 'game'"
    :range-min="settings.rangeMin"
    :range-max="settings.rangeMax"
    :rounds="settings.rounds"
    @finish="finishGame"
  />

  <Summary
    v-else-if="screen === 'summary'"
    :score="lastScore"
    :previous-best="previousBestSnapshot"
    @play-again="startGame"
    @home="goHome"
  />

  <Leaderboard
    v-else-if="screen === 'leaderboard'"
    :users="users"
    :active-user-id="activeUserId"
    @back="goHome"
  />
</template>
