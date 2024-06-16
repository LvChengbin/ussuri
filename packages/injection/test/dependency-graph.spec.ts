/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: injection/dependency-graph.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/10/2022
 * Description:
 ******************************************************************/

import { DependencyGraph } from '../src/dependency-graph';

describe( 'injection/dependency-graph', () => {
    it( 'create graph without any node', () => {
        const graph = new DependencyGraph<string, string>();
        expect( graph.nodes.size ).toBe( 0 );
    } );

    it( 'add nodes into graph', () => {
        const graph = new DependencyGraph<string, string>();
        graph.set( 'n1', 'd1' );
        expect( graph.nodes.size ).toBe( 1 );
        expect( graph.nodes ).toEqual( new Map( [ [ 'n1', 'd1' ] ] ) );
    } );

    it( 'get node data from graph', () => {
        const graph = new DependencyGraph<string, string>();
        graph.set( 'n1', 'd1' );
        expect( graph.get( 'n1' ) ).toEqual( 'd1' );
    } );

    it( 'check if node exists', () => {
        const graph = new DependencyGraph<string, string>();
        graph.set( 'n1', 'd1' );
        expect( graph.has( 'n1' ) ).toBeTruthy();
        expect( graph.has( 'n2' ) ).toBeFalsy();
    } );

    it( 'add dependency', () => {
        const graph = new DependencyGraph<string, string>();
        graph.set( 'n1', 'd1' );
        graph.set( 'n2', 'd2' );
        graph.addDependency( 'n1', 'n2' );
        expect( graph.getDependencies( 'n1' ) ).toEqual( [ 'n2' ] );
        expect( graph.getDependencies( 'n2' ) ).toEqual( [] );
        expect( graph.getDependents( 'n2' ) ).toEqual( [ 'n1' ] );
        expect( graph.getDependents( 'n1' ) ).toEqual( [] );
    } );

    describe( '#dfs', () => {

        function createGraph( size: number ): DependencyGraph<number, number> {
            const graph = new DependencyGraph<number, number>();

            for( let i = 0; i < size; i += 1 ) {
                graph.set( i, i );
            }

            for( let i = 0; i < size - 1; i += 1 ) {
                graph.addDependency( i, i + 1 );
            }
            return graph;
        }

        it( 'return correct size', () => {
            const graph = createGraph( 6 );
            expect( graph.size ).toEqual( 6 );
        } );

        it( 'call the callback function in the correct way', () => {

            const graph = createGraph( 6 );
            const list: number[] = [];

            graph.dfs( 0, ( node, currentPath, hasCircular ) => {
                list.push( node );
                expect( hasCircular ).toBe( false );
            } );

            expect( list ).toEqual( [ 5, 4, 3, 2, 1, 0 ] );
        } );

        it( 'detect circular dependency', () => {
            {
                let circular = false;
                const graph = createGraph( 6 );
                graph.addDependency( 5, 0 );
                graph.dfs( 0, ( node, currentPath, hasCircular ) => {
                    circular = hasCircular;
                } );
                expect( circular ).toEqual( true );
            }

            {
                let circular = false;
                const graph = createGraph( 2 );
                graph.addDependency( 1, 0 );
                graph.dfs( 0, ( node, currentPath, hasCircular ) => {
                    circular = hasCircular;
                } );
                expect( circular ).toEqual( true );
            }
        } );

        it( 'should stop traversing the graph if callback function returns a false', () => {
            const graph = createGraph( 6 );
            const list: number[] = [];

            graph.dfs( 0, ( node ) => {
                if( node === 3 ) return false;
                list.push( node );
            } );

            expect( list ).toEqual( [ 5, 4 ] );
        } );

        it( 'should throw exception while adding dependency with non-existent nodes', () => {
            const graph = createGraph( 6 );
            expect( () => { graph.addDependency( 5, 6 ) } ).toThrow();
        } );
    } );
} );
