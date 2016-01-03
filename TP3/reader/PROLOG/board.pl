
% print char in place of 0, 1 or 2
% 0 -> Black Piece
% 1 -> White Piece
% 2 -> blank Piece
printElement(0,'B').
printElement(1,'W').
printElement(2,'*').  

% print lines of the board
printLine([X|Xs],H, S):- 
        H >= S-1, !,
        printElement(X,Y),
        write(Y);
        
        H < S-1,
        H1 is H+1,
        printElement(X,Y),
        write(Y),
        write('---'),
        printLine(Xs,H1,S).

printBoard(B):-
        length(B,S),
        write('          '),
        printTopTable(0, S), nl,
        write('                            black'), nl,
        printBoard(B, 0, S),
        write('                            black'), nl.

printHorizGrid(S, S).        
printHorizGrid(H, S):-
        H<S,
        write('|   '),
        H1 is H+1,
        printHorizGrid(H1, S).
        
printTopTable(S, S).
printTopTable(H, S):-
        H<10,!,
        H1 is H+1,
        write(' '),write(H1), write('  '),
        printTopTable(H1, S)
        ;
        H<S,
        H1 is H+1,
        write(H1), write(' '),
        printTopTable(H1, S).

% print lines and table
printBoard([X|Nb],H, S):-
        %Middle line, writes white
        S1 is S/2, S2 is S1-1,
        H > S2, H =< S1,
        H1 is H+1,
        write('white '),
        write(H1),
        write(' -> '),
        printLine(X,0,S),
        write(' white'),nl,
        write('           '),
        printHorizGrid(0,S), nl,
        printBoard(Nb,H1,S)
        ;
        % Last line doesn't print Horizontal grid
        H is S-1, !,
        H1 is H+1,
        write('      '),
        write(H1),
        write(' ->'),
        printLine(X, 0, S), nl
        ;
        % H1 >=10
        H > 8, H<S-1, !,
        H1 is H+1,
        write('      '),
        write(H1),
        write(' ->'),
        printLine(X, 0, S), nl,
        write('           '),
        printHorizGrid(0,S), nl,
        printBoard(Nb,H1,S)
        ;
        H>=0,
        H1 is H+1,
        write('      '),
        write(H1),
        write(' -> '),
        printLine(X, 0, S), nl,
        write('           '),
        printHorizGrid(0,S), nl,
        printBoard(Nb,H1,S)
        ;
        write('Error'),nl.      
