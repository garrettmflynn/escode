const fullSuffix = (fileName='') => (fileName).split('.').slice(1)

export const suffix = (fileName='') => {
    const suffix = fullSuffix(fileName) // Allow no name
    return suffix.join('.')
}