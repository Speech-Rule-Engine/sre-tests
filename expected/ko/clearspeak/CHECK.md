## [clearspeak_absolute_value](clearspeak_absolute_value.json)

# Line 22:
      부등호 사용시 조사는 어떻게 할것 인지? ex) x>y : x는 y"보다" 크다
# All:
      1행, 2행 이렇게 할것인지 1 행, 1 열로 말한 것인지 확인.


## [clearspeak_exponents](clearspeak_exponents.json)

# :
    2^2^2 같은 경우 2 의 2 제곱 제곱 으로 읽음. 이 경우 혼동 가능하다고 생각.
    squared => 현제 '제곱' 이라고 되있어서 'power'와 혼동 가능성 있다고 생각 '2제곱'으로 바꾸는건..?
# Line 147:
    times 를 따로 안정해줌. 어디서 정해주는지 찾아보고 확인 필요

## [clearspeak_matrices_vectors_and combinatorics](clearspeak_matrices_vectors_and_combinatorics.json)

# Line 14:
    .이랑 ,은 다 어디로 사라졌는지?
    영어로 돌려봐도 안 나오는데 expected와 output에는 쓰여있음

# Line 26:
    1행/1열의 행렬에서는 '행렬' 뒤에 long pause(두 칸 띄어쓰기)가 적용되지 않음
    long pause가 띄어쓰기를 쓰지 않고 속성만으로 적용될 수 있는 건지 확인 필요

# Line 98:
    'determinant of ~'가 '행렬식 2x2의 행렬' 이런 식으로 나오는데 이게 이해가 가능할지...



## [clearspeak_multi_line_entries](expected\ko\clearspeak\clearspeak_multi_line_entries.json)

# Line 12:
    'equals'는 뭐라고 처리해야? 

# Line 15:
    MathML에서 두 칸 띄어져 있으면 ;으로 변환하는데 어떻게 처리하는지?
    영어로 돌려봐도 node_modules에는 그런 기능 없음...

# Line 21:
    colon -> 콜론으로 지정하는 코드 어디 있는지 찾기

# Line 40:
    'is greater than equal to' 뭐라고 처리해야?

# Line 51:
    케이스에는 케이스 앞에 long pause가 적용되지 않음
    -> 숫자 지정 형식 때문인 듯. -ooo 는 두 칸 띄어쓰기가 되고 ooo-는 안 됨. 어떻게 해결할지?

# Line 66:
    방정식에는 방정식 앞에 long pause가 적용되지 않음

# Line 78:
    혼자 양식에 안 맞는데(총 - 행) 그대로 갈지?

# Line 90:
    조건문에는 조건문 앞에 long pause가 적용되지 않음


## [clearspeak_parentheses](clearspeak_parentheses.json)

# Line 48:
    4분의 3 x 는 three fourths x 랑 다르게 어디까지가 분수인 건지 구분이 안 됨
    이 경우엔 두 개가 같은 식이라 상관 없지만 x가 복잡해지는 경우 문제 생길 듯

# Line 56:
    one half와 다르게 어디까지 제곱 범위에 들어가는 건지 구분이 안 됨

# Line 124:
    output에 ,이 들어있는 원리와 맞출 수 있다면 구간 다음에 콤마 추가하면 좋을 듯?

# Line 187:
    second, third 등이 들어가는 구조 파악 필요