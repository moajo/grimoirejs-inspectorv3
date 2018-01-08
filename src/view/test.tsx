import { ActionsObservable } from "redux-observable";
import { Observable } from "rxjs";

interface PingAction { type: 'PING' }
interface PongAction { type: 'PONG' }
interface SomethingElseAction { type: 'SOMETHING_ELSE' }
interface AnotherThingAction { type: 'ANOTHER_THING' }

type Actions
    = PingAction
    | PongAction
    | SomethingElseAction
    | AnotherThingAction
    ;

// The real output is PongAction but TypeScript doesn't
// seem to care and will accept anything. e.g. number
type OutputActions = number;

function pingEpic(action$: ActionsObservable<Actions>): Observable<OutputActions> {
    return action$.ofType<PingAction>('PING')
        .mapTo<PingAction, PongAction>({ type: 'PONG' });
}

pingEpic(window as any);