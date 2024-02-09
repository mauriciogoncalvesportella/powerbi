/* eslint-disable no-unused-vars */
import { ReplaySubject, Subscription } from 'rxjs'

export enum HeaderDependencie {
  TEAM_DROP_DOWN = 1,
  YEAR_MONTH = 2,
}

// export const HeaderDependencie = {
//   TEAM_DROP_DOWN: 1,
//   YEAR_MONTH: 2
// }

// interface HeaderLoadingData {
//   id: HeaderDependencie,
//   loading: boolean,
//   data?: any
// }
// const headerObserver = new ReplaySubject<HeaderLoadingData>(1)

// const dependenciesLoaded = ref(0)
let teamSubject = new ReplaySubject<boolean>(1)
let yearMonthSubject = new ReplaySubject<boolean>(1)

const check = (dependency: number, targetDependency: number) => {
  return (dependency & targetDependency) === targetDependency
}

const waitHeader = async (depencies: number) => {
  return new Promise<void>((resolve) => {
    let dependenciesLoaded = 0
    let teamObserver: Subscription
    let yearMonthObserver: Subscription

    const checkAllDependenciesResolved = () => {
      if (dependenciesLoaded === depencies) {
        teamObserver?.unsubscribe()
        yearMonthObserver?.unsubscribe()
        resolve()
      }
    }

    checkAllDependenciesResolved()

    if (check(depencies, HeaderDependencie.TEAM_DROP_DOWN)) {
      teamObserver = teamSubject.subscribe(() => {
        teamSubject = new ReplaySubject<boolean>(1)
        dependenciesLoaded |= HeaderDependencie.TEAM_DROP_DOWN
        checkAllDependenciesResolved()
      })
    }

    if (check(depencies, HeaderDependencie.YEAR_MONTH)) {
      yearMonthObserver = yearMonthSubject.subscribe(() => {
        yearMonthSubject = new ReplaySubject<boolean>(1)
        dependenciesLoaded |= HeaderDependencie.YEAR_MONTH
        checkAllDependenciesResolved()
      })
    }
  })
}

const emitTeamSubject = () => teamSubject.next(true)
const emitYearMonthSubject = () => yearMonthSubject.next(true)

export default function UseHeaderLoading () {
  return {
    waitHeader,
    emitTeamSubject,
    emitYearMonthSubject
  }
}
