/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: injection/dependency-graph.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/09/2022
 * Description:
 ******************************************************************/

/**
 * A graph to represent dependencies of injectable objects.
 * It is used to generate information and instantiate injectable classes.
 * Multiple edges need to be supported in the graph because one class could dependent another class multiple times, for example:
 *
 * ```ts
 * class A {
 *     constructor( private b: B, private bb: B ) {}
 * }
 * ```
 */
export class DependencyGraph<Node, Data> {

    #incomingEdges: Map<Node, Node[]> = new Map();

    #outgoingEdges: Map<Node, Node[]> = new Map();

    nodes: Map<Node, Data> = new Map();

    get size(): number {
        return this.nodes.size;
    }

    set( node: Node, data: Data ): this {
        this.nodes.set( node, data );
        this.#incomingEdges.set( node, [] );
        this.#outgoingEdges.set( node, [] );
        return this;
    }

    get( node: Node ): Data | undefined {
        return this.nodes.get( node );
    }

    has( node: Node ): boolean {
        return this.nodes.has( node );
    }

    addDependency( from: Node, to: Node ): void {
        if( !this.has( from ) ) {
            throw new Error( 'Node does not exist: ' + from );
        }

        if( !this.has( to ) ) {
            throw new Error( 'Node does not exist: ' + to );
        }

        this.#outgoingEdges.get( from )?.push( to );
        this.#incomingEdges.get( to )?.push( from );
    }

    getDependencies( node: Node ): Node[] {
        if( !this.has( node ) ) {
            throw new Error( 'Node does not exists: ' + node );
        }
        return this.#outgoingEdges.get( node ) as Node[];
    }

    getDependents( node: Node ): Node[] {
        if( !this.has( node ) ) {
            throw new Error( 'Node does not exists: ' + node );
        }

        return this.#incomingEdges.get( node ) as Node[];
    }

    /**
     * Depth-First traversal for the graph with a start node.
     */
    dfs( start: Node, callback: ( node: Node, currentPath: Node[], hasCircular: boolean ) => boolean | void ): void {

        const visited = new Set<Node>();
        const inCurrentPath = new Set<Node>();
        const currentPath: Node[] = [];
        const stack: ( { node: Node; processed?: true } )[] = [ { node : start } ];
        let hasCircular = false;

        while( stack.length ) {
            const current = stack[ stack.length - 1 ];
            const { node, processed = false } = current;

            if( !processed ) {
                if( visited.has( node ) ) {
                    if( callback( node, currentPath, hasCircular ) === false ) return;
                    stack.pop();
                    continue;
                }

                if( inCurrentPath.has( node ) ) {
                    hasCircular = true;
                    if( callback( node, currentPath, hasCircular ) === false ) return;
                    stack.pop();
                    continue;
                }

                inCurrentPath.add( node );
                currentPath.push( node );

                this.#outgoingEdges.get( node )?.forEach( ( node: Node ) => {
                    stack.push( { node } );
                } );

                current.processed = true;
            } else {
                currentPath.pop();
                if( callback( node, currentPath, hasCircular ) === false ) return;
                stack.pop();
                inCurrentPath.delete( node );
                visited.add( node );
            }
        }
    }
}
