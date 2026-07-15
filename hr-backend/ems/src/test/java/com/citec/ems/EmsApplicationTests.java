package com.citec.ems;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.modulith.core.ApplicationModules;

@SpringBootTest
class EmsApplicationTests {

    @Test
    void contextLoads() {
    }

    @Test
    void verifiesModularStructure() throws ClassNotFoundException {
        ApplicationModules.of(Class.forName("com.citec.ems.EmsApplication")).verify();
    }

}
