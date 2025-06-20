function modifyBackupTime(duration) {
    let finalText = ''
    if (isNaN(duration)) {
        finalText = '-'
    } else if (duration == -1 || duration >= 168) {
        finalText = "7+ Days"
    } else {
        let dayCount = parseInt(duration / 24)
        if (dayCount) {
            let dayText = dayCount == 1 ? 'Day' : 'Days'
            finalText += `${dayCount} ${dayText} `
        }
        let hourCount = duration % 24
        if (hourCount) {
            let hourText = hourCount == 1 ? 'Hr' : 'Hrs.'
            finalText += `${hourCount} ${hourText}`
        }
    }
    return finalText || '0 Hrs'
}

export { modifyBackupTime }