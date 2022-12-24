
const plugins = {
    default: {
      plugin1: {
        tag: 'plugin1',
        src: {
            operator: () => {
                return 1
            }
        }
      },
      plugin2: {
        tag: 'plugin2',
        src: {
            operator: (input) => {
                console.log('target', input)
            }
        }
      },
      plugin3: {
        tag: 'plugin3'
      }
    },
    custom: {
      test: {
        tag: 'test',
        src: {
            operator: () => {
                console.log('This is a test!')
            }
        }
      },
    }
}

export default plugins