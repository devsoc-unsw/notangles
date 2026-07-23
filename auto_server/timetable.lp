% Choose one published class alternative for every activity.
#defined hierarchical/0.
#defined legacy/0.

1 { chosen(A, O) : option(A, O) } 1 :- activity(A).

% Selecting an alternative selects all of its meetings.
selected(A, O, M, D, S, L, C, P) :-
    chosen(A, O),
    meeting(A, O, M, D, S, L, C, P).

% Meetings from different activities must not overlap. The requested gap is
% added after both meetings, so the rule works regardless of their order.
:- selected(A1, _, _, D, S1, L1, _, _),
   selected(A2, _, _, D, S2, L2, _, _),
   A1 < A2,
   gap(G),
   S1 < S2 + L2 + G,
   S2 < S1 + L1 + G.

% Selected weekdays are the highest-priority preference.
disallowed_day(A, O, M, D) :-
    selected(A, O, M, D, _, _, _, _),
    not allowed_day(D).

% Pick at most the requested number of campus days. Meetings outside those
% days form the second preference tier.
0 { campus_day(D) : weekday(D) } K :- max_days(K), K < 5.
outside_compact_day(A, O, M, D) :-
    selected(A, O, M, D, _, _, _, _),
    max_days(K),
    K < 5,
    not campus_day(D).

% Daily time-window violations are counted once per affected day.
before_earliest(D) :-
    selected(_, _, _, D, S, _, _, _),
    earliest(E),
    S < E.
after_latest(D) :-
    selected(_, _, _, D, S, L, _, _),
    latest(E),
    S + L > E.

% Higher priorities dominate every possible improvement at lower priorities.
:~ disallowed_day(A, O, M, D), hierarchical. [1@3, A, O, M, D]
:~ outside_compact_day(A, O, M, D), hierarchical. [1@2, A, O, M, D]
:~ before_earliest(D), hierarchical. [1@1, D, 0]
:~ after_latest(D), hierarchical. [1@1, D, 1]

% Legacy mode reproduces the flat OR-Tools objective for differential tests.
:~ disallowed_day(A, O, M, D), legacy. [2@1, A, O, M, D]
:~ outside_compact_day(A, O, M, D), legacy. [1@1, A, O, M, D]
:~ before_earliest(D), legacy. [1@1, D, 0]
:~ after_latest(D), legacy. [1@1, D, 1]

#show chosen/2.
#show disallowed_day/4.
#show outside_compact_day/4.
#show before_earliest/1.
#show after_latest/1.
