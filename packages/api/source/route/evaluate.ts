import { Expressions, Engine, Situation } from '../types.js'
import { catchError, PickInObject } from '../utils.js'

export interface EvaluateBody {
	expressions: Expressions
	situation?: Situation
}

export function evaluate(
	originalEngine: Engine,
	{ expressions, situation }: EvaluateBody
) {
	const engine = originalEngine.shallowCopy()
	const [situationError] = catchError(() => engine.setSituation(situation))

	if (situationError) {
		return { situationError: { message: situationError.message } }
	}

	const keysKept = [
		'nodeValue' as const,
		'unit' as const,
		'traversedVariables' as const,
		'missingVariables' as const,
	]

	const evaluateResult = (
		Array.isArray(expressions) ? expressions : [expressions]
	).map((expression) => {
		const [error, result] = catchError(() =>
			PickInObject(engine.evaluate(expression), keysKept)
		)

		return !error ? result : { error: { message: error.message } }
	})

	return { evaluate: evaluateResult }
}
