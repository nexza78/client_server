theme:/

    state: ВТемы
        state: ВыборТемы
                q: (тема) 
                 @duckling.number:: anyText || fromState = /ВТемы, onlyThisState = true 
                event: choose_theme || fromState = /ВТемы, onlyThisState = true
                
                if: $request.query != undefined
                    if: $parseTree._anyText < 1
                        a: нет такой темы!
                        go: /ВТемы
                    elseif: $parseTree._anyText > 4
                        a: нет такой темы!
                        go: /ВТемы
                    else:
                        random:
                            a: Отлично, {{$request.query}}!
                            a: {{$request.query}}!
                            a: {{$request.query}} выбрана!
                        script:
                            Topic($parseTree._anyText, $context);
                            addSuggestions(["ответ 1", "номер 2","вариант 3","список тем", "результаты"], $context);
                        
                else:
                    random:
                            a: Отлично, тема {{$request.data.eventData.number}}!
                            a: Тема  {{$request.data.eventData.number}} выбрана!
                            a: Тема {{$request.data.eventData.number}}!
                    script:
                        addSuggestions(["ответ 1", "номер 2","вариант 3","список тем", "результаты"], $context);
                
    
                state: ПравильныйОтвет
                        q: [ответ|вариант|номер]
                            @duckling.number:: anyText
                        event: answer
                        if: $request.query != undefined
                            if: $parseTree._anyText < 1
                                a: нет такого ответа!
                            elseif: $parseTree._anyText > 4
                                a: нет такого ответа!
                            else:
                                script:
                                    addNote($parseTree._anyText, $context);
                                    addSuggestions(["ответ 1", "номер 2","вариант 3","список тем","результаты"], $context);
                        else:
                            script:
                                addSuggestions(["ответ 1", "номер 2","вариант 3","список тем", "результаты"], $context);
         
        
                    
    state: СписокТем
        q!: (~список тем)
        event: list_theme
        random:
            a:Список уже на экране
        script:
            returnTopics($parseTree._anyText, $context);
            addSuggestions(["тема 1"], $context);
        go: /ВТемы
        state: ВТемы
            state: ВыборТемы
                    q: (~тема) 
                     @duckling.number:: anyText || fromState = /ВТемы, onlyThisState = true 
                    event: choose_theme || fromState = /ВТемы, onlyThisState = true
                    
                    if: $request.query != undefined
                        if: $parseTree._anyText < 1
                            a: нет такой темы!
                            go: /ВТемы
                        elseif: $parseTree._anyText > 4
                            a: нет такой темы!
                            go: /ВТемы
                        else:
                            random:
                                a: Отлично, {{$request.query}}!
                                a: {{$request.query}}!
                                a: {{$request.query}} выбрана!
                            script:
                                Topic($parseTree._anyText, $context);
                                addSuggestions(["ответ 1", "номер 2","вариант 3","список тем", "результаты"], $context);
                    else:
                        random:
                            a: Отлично, тема {{$request.data.eventData.number}}!
                            a: Тема  {{$request.data.eventData.number}} выбрана!
                            a: Тема {{$request.data.eventData.number}}!
                            script:
                                addSuggestions(["ответ 1", "номер 2","вариант 3","список тем", "результаты"], $context);
                    
        
                    state: ПравильныйОтвет
                            q: (~ответ|~вариант|номер)
                                @duckling.number:: anyText
                            event: answer
                            if: $request.query != undefined
                                if: $parseTree._anyText < 1
                                    a: нет такого ответа!
                                elseif: $parseTree._anyText > 4
                                    a: нет такого ответа!
                                else:
                                    script:
                                        addNote($parseTree._anyText, $context);
                                        addSuggestions(["ответ 1", "номер 2","вариант 3","список тем", "результаты"], $context);
                            else:
                                    script:
                                        addSuggestions(["ответ 1", "номер 2","вариант 3","список тем", "результаты"], $context);
                                
                    
                                    
                            
    state: ПокажиРезультаты || noContext = true
        q!: [покажи](~результаты|~результат)
        event!: show_res
        random:
            a:Уже на экране!
            a:Сейчас покажу!
            a:Конечно!
        if: $request.query != undefined
            script:
                showResults($parseTree._anyText, $context);
                addSuggestions(["список тем","сброс результатов"], $context);
        else:
            script:
                addSuggestions(["список тем","сброс результатов"], $context);
                
            
    state: СбросРезультатов || noContext = true
        q!: (сброс)(~результатов|~результат)
        event!: del_res
        random:
            a:Сделано!
        if: $request.query != undefined
            script:
                resetResults($parseTree._anyText, $context);
                addSuggestions(["список тем","сброс результатов"], $context);
        else:
            script:
                addSuggestions(["список тем","сброс результатов"], $context);
    
    state: help || noContext=true
        q!: (помощь)
        a:  Чтобы начать игру, необходимо выбрать одну из предпочтительных тем и нажать на кнопку, обозначающую эту тему.
            Переключение между вопросами происходит автоматически после ответа на вопрос.
            Кнопка «показать результаты» показывает таблицу со всеми ответами на вопросы. При желании можно сбросить все результаты, нажав на кнопку «сброс результатов».
            Кнопка «список тем» возвращает к темам.
        script:
            addSuggestions(["список тем","результаты", "сброс результатов"], $context);
        
        
    state: can || noContext=true
        q!: (что ты умеешь)
        a:Я умею выводить на экран темы и вопросы, также я с удовольствие приму ответ. Еще я могу вывести результаты в любой момент!
        script:
            addSuggestions(["список тем","результаты", "сброс результатов"], $context);
    
    state: answer_check || noContext=true
        event!: answer_check
        if: $request.data.eventData.number == 1
            a: Верно
        else:
            a: Неверно
            
    state: CallBack || noContext=true
        event!: noMatch
        a: Я не понимаю
        script:
            addSuggestions(["список тем","результаты", "сброс результатов"], $context);
