const importAssert = (url, assertion) => fetch(url).then(res => res[assertion?.assert?.type === 'text'])

export default importAssert