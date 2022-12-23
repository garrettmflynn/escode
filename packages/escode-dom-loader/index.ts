import * as element from './escode-element-loader'
import * as define from './escode-define-loader'
import { ESComponent } from '../../spec'
import { Options } from '../common/types'
import { specialKeys } from '../../spec/standards'

export const name = 'dom'

export const required = true

const dependents = new Set([
    ...element.properties.dependents,
    ...define.properties.dependents,
])


const dependencies = new Set([
    ...element.properties.dependencies,
    ...define.properties.dependencies,
])

dependencies.delete(specialKeys.element)

export const properties = {
    dependents: Array.from(dependents),
    dependencies: Array.from(dependencies)
}

export default function create(esm: ESComponent, options:Partial<Options> = {}) {
    const el = element.default(esm, options)
    const defined = define.default(el)
    return defined
}