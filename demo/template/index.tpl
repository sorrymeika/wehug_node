@use "./test" as test
<div class="main">
    测试测试<br>
    <a href="/test/1">超链接</a>
    @{
        console.log(test.helpers)
    }
    @test.helpers.testHelper('测试Helper')
    @test.testFn('测试function')
</div>
