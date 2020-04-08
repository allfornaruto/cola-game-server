import { FrontendSession, BackendSession, RemoterClass } from 'pinus';
import { GameRemote } from '../app/servers/game/remote/gameRemote';

declare global {
    interface UserRpc {
        game: {
            gameRemote: RemoterClass<FrontendSession | BackendSession, GameRemote>;
        };
    }
}
