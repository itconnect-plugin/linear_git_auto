import { LinearClient } from './client';
import { LinearLabel } from '../types';
export declare class LabelManager {
    private client;
    constructor(client: LinearClient);
    getOrCreateLabel(teamId: string, name: string, color?: string): Promise<LinearLabel>;
}
//# sourceMappingURL=label-manager.d.ts.map