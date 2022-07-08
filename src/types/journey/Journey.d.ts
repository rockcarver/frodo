import { AnyNodeTypes } from './NodeTypes';

export interface Journey {
    _id: string;
    _rev: string;
    identityResource: string;
    uiConfig: {
        categories?: string;
    };
    entryNodeId: string;
    nodes: {
        [k: string]: {
            connections: {
                _outcome: string;
            };
            displayName: string;
            nodeType: AnyNodeTypes;
            x: number;
            y: number;
        }
    };
    description?: string;
    staticNodes: {
        [key: string]: {
            x: number;
            y: number;
        }
    };
    enabled: boolean;
}


export interface JourneyResponse {
    result: Array<Journey>;
    resultCount: number;
    pagedResultsCookie: null;
    totalPagedResultsPolicy: string;
    totalPagedResults: number;
    remainingPagedResults: number;
}