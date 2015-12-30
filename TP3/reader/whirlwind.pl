:- consult(board).
:-use_module(library(random)).

% 0 player is black | 1 player is white | 2 empty place | 3 comp is black | 4 comp is white

init :-
      nl,
      write('###################################'), nl,
      write('#*********************************#'), nl,
      write('#*********************************#'), nl,
      write('#            Whirlwind            #'), nl,
      write('#*********************************#'), nl,
      write('#*********************************#'), nl,
      write('###################################'), nl, nl,
     
      % boardSizeSelector(S),
      % board(B, S),
      board(B, 12),
      gameMode(B, Player1-P1, Player2-P2),
      gameCycle(B, Player1-P1, Player2-P2).
      
boardSizeSelector(Bs):-
        write('What is the board size which you want to play with? (even size between 12-20)'), nl,
        read(S),
        (
           integer(S),
           S>11, S<21,
           Size1 is mod(S, 2),
           Size1 == 0,!,
           Bs=S
        ; 
           write('Invalid size!'), nl,
           boardSizeSelector(Bs)
        ).
board(Nb, S):-
        fillBoard(S, Rows, 2),
        fillBoard(S, B, Rows),
        Fp is round(S/2 +1 -8),
        Fp > -1, !,
        fillColumn(B, Nb, S, 0, Fp-0, Fp-0)
        ;
        fillBoard(S, Rows, 2),
        fillBoard(S, B, Rows),      
        Fp is round(S/2 +1 -4),
        Fp > -1,
        fillColumn(B, Nb, S, 0, Fp-1, Fp-1).
        
        

fillBoard(0, [], _).
fillBoard(S, [V|Tail], V):- 
        S>0,
        S1 is S-1,
        fillBoard(S1, Tail, V). 

fillColumn(B, B, S, S,_,_).
fillColumn(B, Nb, S, Col, Fp-Fc, Y-C):-  
        Y<S,
        placePiece(B, Col-Y, C, B1),
        Y1 is Y+5, 
        switchColor(C, Nc),
        fillColumn(B1, Nb, S, Col, Fp-Fc, Y1-Nc).
fillColumn(B, Nb, S, Col, Fp-Fc, _):-
        Col1 is Col+1,
        nextLine(Fp, P, Fc, Nc),
        fillColumn(B, Nb, S, Col1, P-Nc, P-Nc).

nextLine(Fp, P, Fc, Nc):-
        Fp == 0, !,
        Nc is Fc,
        P is 3
        ;
        Fp == 1, !,
        Nc is Fc,
        P is 4
        ;
        Fp == 2, !,
        switchColor(Fc, Nc),
        P is 0
        ;
        Fp == 3, !,
        switchColor(Fc, Nc),
        P is 1
        ;
        Fp == 4, !,
        switchColor(Fc, Nc),
        P is 2.
        
switchColor(C, Nc):-
        C==0, !, 
        Nc = 1;
        C==1, !,
        Nc = 0.        
               
% Select Number of Players (0/1/2)
gameMode(B, Player1-P1, Player2-P2) :- 
         write('Number of players ? (0, 1 or 2)'), 
         nl,
         read(Num), nl,
         (
            Num \= 0, Num \= 1, Num \= 2, !,  % Incorrect selection
            write('Error : not a valid selection !'), nl,
            gameMode(B, Player1-P1, Player2-P2) % repeat until a valid value is selected
         ;
            Num == 0, !, % if comp vs comp
            Player1 is 3, Player2 is 4, % Player1 <- comp(white) | Player2 <- comp(black)
            P1 is 0, P2 is 1 % When PX is 0 means is PlayerX turn
         ;
            plColor(B,Num, Player1-P1, Player2-P2) % Player selects color
         ).
          
% Ask the color for the player 1 and start the game with it.
plColor(B,Mode, Player1-P1, Player2-P2) :-
          write('Player 1: Select color of pieces ? ((0 - Black or 1 - White)'), nl,
          Mode == 1, !,  % Player vs Computer
          read(Player1), nl,
          (
           Player1 == 0,!,
           P1 is 1, P2 is 0, % if Player1 selects black, starts playing
           Player2 is 4
          ;
           Player1 == 1,!, % if Player1 selects white, Computer starts playing
           P1 is 0, P2 is 1,
           Player2 is 3
          ;
           Player1 \= 0, Player1 \=1, !,
           write('Error : not a valid color !'), nl,
           plColor(B, Mode, Player1-P1, Player2-P2) % repeat until a valid value is selected
          )
          ;   
          Mode == 2, !,  % Player1 vs Player2
          read(Player1), nl,
          (
           Player1 == 0,!, % if Player1 selects black, starts playing
           P1 is 1, P2 is 0,
           Player2 is 1
          ;
           Player1 == 1,!, % if Player1 selects white, Player2 or Computer starts playing
           P1 is 0, P2 is 1,
           Player2 is 0
          ;
           Player1 \= 0, Player1 \=1, !, % Incorrect selection
           write('Error : not a valid color !'), nl,
           plColor(B,Mode, Player1-P1, Player2-P2) % repeat until a valid value is selected
          ).

% Game cycle

gameCycle(B, Player1-P1,Player2-_):-
        playerWins(B, Player1);
        Player1 == 3, % computer vs computer mode
        printBoard(B),
        (
        P1 == 0, !, % If last turn was P1 turn
        NP1 = 1, NP2 = 0, % Switch Players turns
        write(NP1),nl,
        write('Player 2 turn'), nl,
        randMove(B, Player2-NP2, Nb), % Starts new turn
        gameCycle(Nb, Player1-NP1, Player2-NP2)
        ;
        P1 == 1, !, % If last turn was P2 turn
        NP1 = 0, NP2 = 1, % Switch Players turns
        write(NP1),nl,
        write('Player 1 turn'), nl,
        randMove(B, Player1-NP1, Nb), % Starts new turn
        gameCycle(Nb, Player1-NP1, Player2-NP2)
        ).

gameCycle(B, Player1-P1,Player2-_):-
        playerWins(B, Player1);
        Player2 == 4, % player vs computer mode
        printBoard(B),
        (
        P1 == 0, !, % If last turn was P1 turn
        NP1 = 1, NP2 = 0, % Switch Players turns
        write(NP1),nl,
        write('Player 2 turn'), nl,
        randMove(B, Player2-NP2, Nb), % Starts new turn
        gameCycle(Nb, Player1-NP1, Player2-NP2)
        ;
        P1 == 1, !, % If last turn was P2 turn
        NP1 = 0, NP2 = 1, % Switch Players turns
        write(NP1),nl,
        write('Player 1 turn'), nl,
        nextPlay(B, Player1-NP1, Nb), % Starts new turn
        gameCycle(Nb, Player1-NP1, Player2-NP2)
        ).

gameCycle(B, Player1-P1,Player2-_):-
        playerWins(B, Player1);
        printBoard(B),
        (
        P1 == 0, !, % If last turn was P1 turn
        NP1 = 1, NP2 = 0, % Switch Players turns
        write(NP1),nl,
        write('Player 2 turn'), nl,
        nextPlay(B, Player2-NP2, Nb), % Starts new turn
        gameCycle(Nb, Player1-NP1, Player2-NP2)
        ;
        P1 == 1, !, % If last turn was P2 turn
        NP1 = 0, NP2 = 1, % Switch Players turns
        write(NP1),nl,
        write('Player 1 turn'), nl,
        nextPlay(B, Player1-NP1, Nb), % Starts new turn
        gameCycle(Nb, Player1-NP1, Player2-NP2)
        ).

playerWins(B, Player):-
        length(B,S),
        S1 is S-1,
        (
           track(B, [], _-0, _-S1, _Con, 0 ), % Black wins
           (
              Player == 0, write('PLAYER 1 WON'),nl
           ;
              write('PLAYER 2 WON'),nl
           )
        ;
           track(B, [], 0-_, S1-_, _Con, 1 ), % White wins
           (
              Player == 0, write('PLAYER 2 WON'),nl
           ;
              write('PLAYER 1 WON'),nl
           )     
        ).

track(B, Path, Xi-Yi, Xf-Yf, Con, C):-
       connected(B,Xi-Yi, Xf-Yf,C),
       \+ mem(X-Y, Path),
       track(B,[Xi-Yi|Path], X-Y, Xf-Xf, Con, C). 

connected(B, X-Y, Xf-Yf, C):-
        checkPlace(B, X-Y, C),
        checkPlace(B, Xf-Yf, C),
        (
           X==Xf, T=Y-1, Y==T
        ;
           X==Xf, T=Y+1, Y==T
        ;
           T=Xf+1, T==X, Y==Yf
        ;
           T=Xf-1, T==X, Y==Yf  
        ).
        
mem(X, [X|_]):- !.
mem(X, [_|Y]):-mem(X,Y).

randMove(B, Player-P, Nb):-
        write('How many moves do you want to play in your turn? (1 or 2)'), nl,
        random(1,3,N),
        write(N),
        N==1,!,
        compRandMove(X,Y),
        makeMove(B, X-Y, Player-P, Nb);
        compRandMove(X,Y),
        makeMove(B, X-Y, Player-P, Nb),
        compRandMove(X,Y),
        makeMove(B, X-Y, Player-P, Nb).
           
% Player input
nextPlay(B, Player-P, Nb) :-
        write('How many moves do you want to play in your turn? (1 or 2)'), nl,
        read(N), nl,
        (
           N \= 1, N \= 2, !, % Incorrect selection
           write('Error : not a valid selection !'), nl,
           nextPlay(B, Player-P, Nb)
        ;   
           N == 1, !,  % Only one move this turn                                                                   
           write('Where do you want to play? (e.g. 3-3.)'), nl,
           read(X1-Y1), nl,
           (
               length(B,L),
               integer(X1),
               integer(Y1),
               X1>L, Y1>L, !, % Incorrect selection
               write('Error : not a valid input !'), nl;
               X is X1-1, Y is Y1-1,
               makeMove(B, X-Y, Player-P, Nb) 
           )
           
        ;
           N == 2, !, % Two moves this turn                                                                  
           write('Where do you want to play? (e.g. 3-3. 3-2.)'), nl,
           length(B,L),
           read(IX1-IY1), nl,
           (
               integer(IX1),
               integer(IY1),
               IX1>L, IY1>L, !, % Incorrect selection
               write('Error : not a valid input !'), nl;
               X1 is IX1-1, Y1 is IY1-1,
               makeMove(B,X1-Y1, Player-P, Nb)
           ),
           read(IX2-IY2), nl,  
           (
               integer(IX2),
               integer(IY2),
               IX2>L, IY2>L, !, % Incorrect selection
               write('Error : not a valid input !'), nl;
               X2 is IX2-1, Y2 is IY2-1,
               makeMove(B, X2-Y2, Player-P, Nb)
           )
         ).
           
% Checks if move is valid
makeMove(B,X-Y, Player-P, New) :-
           checkPlace(B, X-Y, 2),!, % checks if place where to move is empty
           write('CheckPlace <- true'), nl,
           placePiece(B, X-Y,Player,Nb), % places piece with player color in X-Y position
           write('PlacePiece <- true'), nl,
           validateMove(Nb,X-Y,P),
           write('ValidateMove <- true'), nl,
           New = Nb;
           New =B,
           write("Not a valid move! That's already a piece in this position"),nl.  

% Change piece in X-Y position
placePiece(B, X-Y, Player, Nb):-
        posVerifier(Y, B, Row),
        switchPiece(Player, Row, X, Np),
        switchPiece(Np, B, Y, Nb).

% verifys n position in the B
posVerifier(0, [Head|_],Head).
posVerifier(N, [_|Tail],Elem) :-
        nonvar(N),
        M is N-1,
        posVerifier(M, Tail, Elem).       

switchPiece(P, [_|List], 0, [P|List]).
switchPiece(P, [Head|List], X, [Head|Rest]):- 
        X1 is X-1,
        switchPiece(P,List,X1,Rest).    

% Verifies if piece in board is from Players color
checkPlace(B, X-Y, P):-
        posVerifier(Y, B, Row),
        posVerifier(X, Row, P).

% Verifies if new piece is diagonal with other piece of the same color
diagValidation(B, X-Y, X1-Y1, Player) :-
        checkPlace(B, X1-Y1, Player), % check diagonal
        (
           checkPlace(B, X1-Y,Player) % check proximity
        ; 
           checkPlace(B, X-Y1,Player) % check proximity
        ). 
diagValidation(B, _, X1-Y1, Player) :-
        \+ checkPlace(B, X1-Y1, Player).

% Verifys if move can be made
validateMove(B, X-Y, Player) :-
        X1 = X-1, Y1 = Y-1,
        diagValidation(B, X-Y, X1-Y1, Player),
        X2 = X+1, Y2 = Y-1,
        diagValidation(B, X-Y, X2-Y2, Player),
        X3 = X+1, Y3 = Y+1,
        diagValidation(B, X-Y, X3-Y3, Player),
        X4 = X-1, Y4 = Y+1,
        diagValidation(B, X-Y, X4-Y4, Player).            

compRandMove(X-Y, S):-
        random(1,S+1, X),
        random(1,S+1, Y).
 
